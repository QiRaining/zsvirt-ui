import { Inject, Injectable } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetHostBlockDevicesAction } from '@/api/zstack/GetHostBlockDevicesAction'
import { GetMetricDataAction, GetMetricDataActionParam } from '@/api/zstack/GetMetricDataAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { HardwareSummaryService } from '../host/query/summary.service'
import {
  DiskUsage,
  QueryDiskArgs,
  QueryDiskResp,
  QueryHostBlockDevicesArgs,
  DiskReadyState
} from './disk.model'

@Injectable()
export class DiskService {
  @Inject() zqlService: ZQLService
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() hardwareSummaryService: HardwareSummaryService
  @Inject() getHostBlockDevicesAction: GetHostBlockDevicesAction

  async diskList(params: QueryDiskArgs): Promise<QueryDiskResp> {
    return await this.getDiskList(params)
  }

  async getDiskList(params: IQueryAction) {
    const hostUuid = params.conditions?.find(item => item.key === 'hostUuid')?.value
    const mediaType = params.conditions?.find(item => item.key === 'mediaType')?.value

    const hostConnected = await this.hardwareSummaryService.getHostConnected(hostUuid)

    const zqlCondition = {
      raidControllerUuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'RaidController',
            fields: ['uuid'],
            condition: {
              hostUuid
            }
          }
        }
      }
    }

    const zqlObject = {
      tableName: 'RaidPhysicalDrive',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)

    const { results } = await this.zqlService.call(zql)
    const list = results?.[0]?.inventories ?? []

    const diskStateMetricParam: GetMetricDataActionParam = {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'PhysicalDiskState',
      labels: [`HostUuid=${hostUuid}`]
    }
    const { data: diskStateMetricList = [] } =
      await this.getMetricDataAction.call(diskStateMetricParam)

    const lifeLeftMetricParam: GetMetricDataActionParam = {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'SSDLifeLeft',
      labels: [`HostUuid=${hostUuid}`]
    }
    const { data: lifeLeftMetricList = [] } =
      await this.getMetricDataAction.call(lifeLeftMetricParam)

    const temperatureMetricParam: GetMetricDataActionParam = {
      namespace: 'ZStack/Host',
      offsetAheadOfCurrentTime: 1,
      metricName: 'SSDTemperature',
      labels: [`HostUuid=${hostUuid}`]
    }
    const { data: temperatureMetricList = [] } =
      await this.getMetricDataAction.call(temperatureMetricParam)

    // 全闪盘的机器，不显示缓存盘，只显示数据盘
    const isAllSSD = list.every(item => item.mediaType?.toUpperCase() === 'SSD')
    const hasRaid1 = list.some(item => item.raidLevel?.toUpperCase() === 'RAID1')

    const parsedList = list
      .filter(item => item.mediaType?.toUpperCase() === mediaType.toUpperCase())
      .map(item => {
        const {
          uuid,
          slotNumber,
          raidLevel,
          mediaType,
          size,
          locateStatus,
          enclosureDeviceId,
          serialNumber,
          driveType,
          deviceModel,
          rotationRate
        } = item
        let diskUsage = ''
        if (hasRaid1) {
          if (raidLevel?.toUpperCase() === 'RAID1') {
            diskUsage = DiskUsage.SystemDisk
          } else {
            if (isAllSSD) {
              diskUsage = DiskUsage.DataDisk
            } else {
              if (mediaType?.toUpperCase() === 'SSD') {
                diskUsage = DiskUsage.CacheDisk
              } else {
                diskUsage = DiskUsage.DataDisk
              }
            }
          }
        } else {
          if (mediaType?.toUpperCase() === 'SSD') {
            if (size > 400 * 1024 ** 3 && size < 500 * 1024 ** 3) {
              diskUsage = DiskUsage.SystemDisk
            } else {
              if (isAllSSD) {
                diskUsage = DiskUsage.DataDisk
              } else {
                diskUsage = DiskUsage.CacheDisk
              }
            }
          } else {
            diskUsage = DiskUsage.DataDisk
          }
        }

        const diskType = mediaType

        let readyState = ''
        if (!hostConnected) {
          readyState = DiskReadyState.Unknown
        } else {
          const readyStateValue = diskStateMetricList.find(
            metricItem =>
              metricItem.labels.SlotNumber == slotNumber &&
              metricItem.labels.DiskGroup == enclosureDeviceId
          )?.value
          switch (Number(readyStateValue)) {
            case 0:
              readyState = DiskReadyState.Normal
              break
            case 5:
              readyState = DiskReadyState.Rebuilding
              break
            case 10:
              readyState = DiskReadyState.Offline
              break
            default:
              readyState = DiskReadyState.Abnormal
          }
        }

        let ssdRemainingLife = lifeLeftMetricList.find(
          metricItem => metricItem.labels.SerialNumber === serialNumber
        )?.value
        if (ssdRemainingLife) {
          ssdRemainingLife = ssdRemainingLife + '%'
        }

        const temperature = temperatureMetricList.find(
          metricItem => metricItem.labels.SerialNumber === serialNumber
        )?.value

        const model = deviceModel
        const rotateSpeed = rotationRate

        return {
          uuid,
          slotNumber,
          diskUsage,
          diskType,
          size,
          readyState,
          ssdRemainingLife,
          locateStatus,
          driveType,
          model,
          temperature,
          rotateSpeed,
          hostUuid
        }
      })

    return {
      list: parsedList,
      total: parsedList.length
    }
  }

  async hostBlockDevicesList(params: QueryHostBlockDevicesArgs) {
    const uuid = params.conditions?.find(item => item.key === 'hostUuid')?.value
    const partition = params.conditions?.find(item => item.key === '__partition__')?.value
    const { blockDevices = [] } = await this.getHostBlockDevicesAction.call({
      uuid
    })
    let list = blockDevices
    if (partition) {
      list = blockDevices.find(item => item.name === partition)?.children || []
      ;[...list].forEach(item => {
        if (item.children?.length) {
          list.push(...item.children)
        }
      })
    }
    if (params.sortBy === 'name') {
      const sortFn =
        params.sortDirection === 'asc'
          ? (a, b) => a.name.localeCompare(b.name)
          : (a, b) => b.name.localeCompare(a.name)
      list = list.sort(sortFn)
    }
    const total = list.length
    const start = params.start || 0
    const limit = params.limit || total
    list = list.slice(start, start + limit)
    return { list, total }
  }
}
