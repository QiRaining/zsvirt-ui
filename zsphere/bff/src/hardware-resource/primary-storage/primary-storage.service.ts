import { Inject, Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import * as _ from 'lodash'

import { AddAliyunEbsPrimaryStorageAction } from '@/api/zstack/AddAliyunEbsPrimaryStorageAction'
import { AddAliyunNasPrimaryStorageAction } from '@/api/zstack/AddAliyunNasPrimaryStorageAction'
import { AddCephPrimaryStorageAction } from '@/api/zstack/AddCephPrimaryStorageAction'
import { AddLocalPrimaryStorageAction } from '@/api/zstack/AddLocalPrimaryStorageAction'
import { AddNfsPrimaryStorageAction } from '@/api/zstack/AddNfsPrimaryStorageAction'
import { AddSharedBlockGroupPrimaryStorageAction } from '@/api/zstack/AddSharedBlockGroupPrimaryStorageAction'
import { AddSharedMountPointPrimaryStorageAction } from '@/api/zstack/AddSharedMountPointPrimaryStorageAction'
import { AttachPrimaryStorageToClusterAction } from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangePrimaryStorageStateAction } from '@/api/zstack/ChangePrimaryStorageStateAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeletePrimaryStorageAction } from '@/api/zstack/DeletePrimaryStorageAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { DetachPrimaryStorageFromClusterAction } from '@/api/zstack/DetachPrimaryStorageFromClusterAction'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import {
  GetPrimaryStorageUsageReportAction,
  GetPrimaryStorageUsageReportActionParam
} from '@/api/zstack/GetPrimaryStorageUsageReportAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { ReconnectHostAction } from '@/api/zstack/ReconnectHostAction'
import { ReconnectPrimaryStorageAction } from '@/api/zstack/ReconnectPrimaryStorageAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { GetMetricDataArgs } from '@/common/metric-data/metric-data.model'
import { PrimaryStorageQueryService } from '@/hardware-resource/primary-storage/primary-storage-query/primary-storage-query.service'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'

import { getAvailablePsTypes } from './helper'
import { PrimaryStoragePredictionCapacityArgs } from './primary-storage.model'

@Injectable()
export class PrimaryStorageService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() reconnectHostAction: ReconnectHostAction
  @Inject() deleteTagAction: DeleteTagAction
  @Inject()
  queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject()
  deletePrimaryStorageAction: DeletePrimaryStorageAction
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject()
  changePrimaryStorageStateAction: ChangePrimaryStorageStateAction
  @Inject()
  addLocalPrimaryStorageAction: AddLocalPrimaryStorageAction
  @Inject()
  addNfsPrimaryStorageAction: AddNfsPrimaryStorageAction
  @Inject() querySystemTagAction: QuerySystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject()
  addSharedMountPointPrimaryStorageAction: AddSharedMountPointPrimaryStorageAction
  @Inject()
  addSharedBlockGroupPrimaryStorageAction: AddSharedBlockGroupPrimaryStorageAction
  @Inject()
  addCephPrimaryStorageAction: AddCephPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction
  @Inject()
  detachPrimaryStorageFromClusterAction: DetachPrimaryStorageFromClusterAction
  @Inject()
  reconnectPrimaryStorageAction: ReconnectPrimaryStorageAction
  @Inject()
  queryClusterAction: QueryClusterAction
  @Inject()
  primaryStorageQueryService: PrimaryStorageQueryService
  @Inject()
  addAliyunNasPrimaryStorageAction: AddAliyunNasPrimaryStorageAction
  @Inject()
  addAliyunEbsPrimaryStorageAction: AddAliyunEbsPrimaryStorageAction
  @Inject()
  resourceConfigService: ResourceConfigService
  @Inject()
  getPrimaryStorageUsageReportAction: GetPrimaryStorageUsageReportAction

  async queryPrimaryStorage(params) {
    return await this.primaryStorageQueryService.query(params)
  }

  /**
   * 创建PS的时候，可加载的集群列表uuidList
   * @param psType
   * @param isOpensource
   */
  async getPrimaryStorageAttachableClusterByType(psType, isOpensource = false) {
    const clusterResp = await this.queryClusterAction.call({
      fields: ['uuid']
    })
    const clusterUuids = clusterResp.inventories.map(it => it.uuid)
    if (_.isBoolean(isOpensource) && isOpensource) {
      return clusterUuids
    } else {
      const _resultList = []
      const tasks = []
      let p = null
      clusterUuids.forEach(uuid => {
        p = this.queryPrimaryStorage
          .call({
            conditions: [
              {
                key: 'cluster.uuid',
                value: uuid
              }
            ]
          })
          .then(resp => {
            const psTypes = getAvailablePsTypes(resp.inventories)
            if (psTypes.includes(psType)) {
              _resultList.push(uuid)
            }
          })
        tasks.push(p)
      })
      return await Promise.all(tasks).then(() => _resultList)
    }
  }

  /**
   * 已经存在PS可加载的集群
   * @param primaryStorage
   * @param isOpensource
   */
  async getPrimaryStorageAttachableCluster(primaryStorage, isOpensource = false) {
    const { type, attachedClusterUuids = [] } = primaryStorage
    const attachableClusterUuids = await this.getPrimaryStorageAttachableClusterByType(
      type,
      isOpensource
    )
    return _.difference(attachableClusterUuids, attachedClusterUuids)
  }

  async getPrimaryStorageMetricData(params: GetMetricDataArgs) {
    params.labels = params?.labels
      ? [`PrimaryStorageUuid=${params?.uuid}`, ...params.labels]
      : [`PrimaryStorageUuid=${params?.uuid}`]

    const { data = [] } = await this.getMetricDataAction.call(params)
    return data
  }
  //获取主存储容量预测图表信息
  async getPrimaryStoragePredictionCapacity(params: PrimaryStoragePredictionCapacityArgs) {
    const query: GetPrimaryStorageUsageReportActionParam = {
      primaryStorageUuid: params.primaryStorageUuid
    }
    if (params?.poolUuid) {
      query.uris = [`ceph://${params?.poolUuid}`]
    }

    const res = await this.getPrimaryStorageUsageReportAction.call(query)
    let result = res?.usageReport
    if (params?.poolUuid) {
      result = res?.uriUsageForecast[params?.poolUuid]
    }

    const startDay = dayjs(params.startTime).format('YYYY-MM-DD')
    const currentDay = dayjs(params.currentTime).format('YYYY-MM-DD')
    const endDay = dayjs(params.endTime).format('YYYY-MM-DD')

    const formatMetricData = (data: number[], startTime: number, interval = 1, type: string) => {
      if (!data || !data?.length) {
        return []
      }
      let startIndex = -1
      let currentIndex = -1
      let endIndex = -1

      const list =
        data?.map((item, index) => {
          const time = startTime + index * interval * 24 * 60 * 60 * 1000
          const timeDay = dayjs(time).format('YYYY-MM-DD')
          if (timeDay === startDay) {
            startIndex = index
          }
          if (timeDay === currentDay) {
            currentIndex = index
          }
          if (timeDay === endDay) {
            endIndex = index
          }
          return {
            value: item * 1024 * 1024 * 1024,
            time: dayjs(timeDay).valueOf(),
            type
          }
        }) ?? []

      const start = startIndex !== -1 ? startIndex : 0
      const _endIndex = type === 'usedPhysicalCapacitiesForecast' ? endIndex : currentIndex
      const _endTime =
        type === 'usedPhysicalCapacitiesForecast' ? params.endTime : params.currentTime

      if (_endIndex !== -1) {
        return list.slice(start, _endIndex + 1)
      }

      if (
        list.length > 0 &&
        list[list.length - 1].time <= dayjs(dayjs(_endTime).format('YYYY-MM-DD')).valueOf()
      ) {
        return list.slice(start)
      }

      return []
    }

    const {
      usedPhysicalCapacitiesForecast,
      usedPhysicalCapacitiesHistory,
      totalPhysicalCapacitiesHistory,
      startTime,
      interval = 1
    } = result ?? {}
    const hasEnoughHistoryData = (usedPhysicalCapacitiesHistory?.length ?? 0) >= 15
    // 物理容量使用预测
    const usedPhysicalCapacitiesForecastList = formatMetricData(
      hasEnoughHistoryData ? usedPhysicalCapacitiesForecast : [],
      startTime,
      interval,
      'usedPhysicalCapacitiesForecast'
    )
    // 物理已用容量
    const usedPhysicalCapacitiesHistoryList = formatMetricData(
      usedPhysicalCapacitiesHistory,
      startTime,
      interval,
      'usedPhysicalCapacitiesHistory'
    )
    // 物理总容量
    const totalPhysicalCapacitiesHistoryList = formatMetricData(
      totalPhysicalCapacitiesHistory,
      startTime,
      interval,
      'totalPhysicalCapacitiesHistory'
    )

    const resourceData = await this.resourceConfigService.queryResourceConfigInPage({
      conditions: [
        {
          key: 'categoryList',
          values: ['primaryStorage'],
          op: Op.in
        },
        {
          key: 'nameList',
          values: ['primaryStorage.used.physicalCapacity.forecast.threshold'],
          op: Op.in
        },
        {
          key: 'resourceUuid',
          value: params.primaryStorageUuid,
          op: Op.eq
        }
      ],
      extraConditions: []
    })
    const capacityAlarmThreshold = Number(resourceData?.list?.[0]?.value)
    const currentTotalPhysicalCapacity =
      totalPhysicalCapacitiesHistoryList[totalPhysicalCapacitiesHistoryList.length - 1]?.value

    // 容量告警阈值
    const physicalCapacitiesAlarmThresholdList = []
    // 预计容量超出阈值的点
    let forecastAlarmPoint
    if (_.isNumber(capacityAlarmThreshold) && _.isNumber(currentTotalPhysicalCapacity)) {
      for (let i = params.startTime; i <= params.endTime; i += interval * 24 * 60 * 60 * 1000) {
        physicalCapacitiesAlarmThresholdList.push({
          value: capacityAlarmThreshold * currentTotalPhysicalCapacity,
          time: dayjs(dayjs(i).format('YYYY-MM-DD')).valueOf(),
          type: 'physicalCapacitiesAlarmThreshold'
        })
      }

      forecastAlarmPoint = usedPhysicalCapacitiesForecastList.find(item => {
        if (
          item.time > dayjs(currentDay).valueOf() &&
          item.value / currentTotalPhysicalCapacity >= capacityAlarmThreshold
        ) {
          return true
        }
        return false
      })
    }

    const predictAlarmPoint = forecastAlarmPoint
      ? {
          time: forecastAlarmPoint.time,
          value: capacityAlarmThreshold * currentTotalPhysicalCapacity,
          type: 'physicalCapacitiesAlarmThreshold'
        }
      : null

    const currentDayPoint = usedPhysicalCapacitiesHistoryList.find(item => {
      return item.time === dayjs(currentDay).valueOf()
    })

    return {
      usedPhysicalCapacitiesForecastList,
      usedPhysicalCapacitiesHistoryList,
      totalPhysicalCapacitiesHistoryList,
      physicalCapacitiesAlarmThresholdList,
      predictAlarmPoint,
      currentDayPoint
    }
  }
}

export interface GetMetricDataActionParam {
  namespace: string
  metricName: string
  startTime?: number
  endTime?: number
  offsetAheadOfCurrentTime?: number
  period?: number
  labels?: any[]
  functions?: any[]
  systemTags?: any[]
  userTags?: any[]
  sessionId?: any
  accessKeyId?: any
  accessKeySecret?: any
  requestIp?: any
}
