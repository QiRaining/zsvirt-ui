import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'
import { GetCpuMemoryCapacityAction } from '@/api/zstack/GetCpuMemoryCapacityAction'
import { GetIpAddressCapacityAction } from '@/api/zstack/GetIpAddressCapacityAction'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import {
  GetResourceConfigAction,
  GetResourceConfigResult
} from '@/api/zstack/GetResourceConfigAction'
import { Cache, CacheService } from '@/common/cache'
import ZQL, { ZOp } from '@/common/zql/index'
import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'

import { parseSize } from './widget-usage-statistics.service'

@Injectable()
export class ZSVWidgetUsageStatisticsService {
  @Inject() zqlService: ZQLService
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() getCpuMemoryCapacityAction: GetCpuMemoryCapacityAction
  @Inject() getIpAddressCapacityAction: GetIpAddressCapacityAction
  @Inject() getAccountQuotaUsageAction: GetAccountQuotaUsageAction
  @Inject() getResourceConfigAction: GetResourceConfigAction
  @Inject() capacityCalculationQueryService: CapacityCalculationQueryService
  @Inject() private cacheService: CacheService

  @Cache<any>({ ttl: 9 })
  async getMetricData(queryArgs) {
    const {
      tableName,
      resourceKey,
      monitorItem,
      zoneKey = 'zoneUuid',
      zoneUuid,
      metricName = '',
      accountUuid = '',
      currentIdentity = '',
      hypervisorType = 'kvm',
      uuid = ''
    } = queryArgs
    // 获取容量
    const {
      usedPercent,
      totalCapacity,
      usedCapacity,
      availableCapacity,
      totalPhysicalCapacity,
      usedPhysicalCapacity,
      availablePhysicalCapacity
    } = await this.getCapacityStatistics({
      tableName,
      zoneKey,
      zoneUuid,
      resourceKey,
      monitorItem,
      metricName,
      accountUuid,
      currentIdentity,
      hypervisorType,
      uuid
    })

    // 主存储实际使用率
    if (resourceKey === 'primaryStorage' && monitorItem === 'actualUsedRate') {
      return {
        capacityData: {
          totalCapacity: totalPhysicalCapacity,
          usedCapacity: usedPhysicalCapacity,
          availableCapacity: availablePhysicalCapacity
        }
      }
    }

    return {
      capacityData: {
        totalCapacity,
        usedCapacity,
        availableCapacity,
        usedPercent
      }
    }
  }

  // 获取用量统计值
  getCapacityStatistics = async ({
    tableName,
    zoneKey,
    zoneUuid,
    resourceKey,
    monitorItem,
    metricName,
    accountUuid,
    currentIdentity,
    hypervisorType = 'kvm',
    uuid
  }) => {
    let resourceList = []
    let usedPercent = 0
    let totalCapacity = 0
    let availableCapacity = 0
    let usedCapacity = 0
    let totalPhysicalCapacity = 0
    let availablePhysicalCapacity = 0
    let usedPhysicalCapacity = 0
    let reservedCapacity = 0
    const operator = hypervisorType === 'kvm' ? ZOp.ne : ZOp.eq
    // 主存储和镜像服务器
    if (['primaryStorage', 'backupStorage'].includes(tableName)) {
      let capacityZqlObject
      if (zoneKey && zoneUuid) {
        // 当前区域查询
        let condition
        if (tableName === 'backupStorage') {
          condition = {
            [zoneKey]: zoneUuid,
            type: {
              [operator]: 'VCenter'
            },
            __systemTag__: {
              [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
            }
          }
        } else {
          condition = {
            zoneUuid: zoneUuid,
            type: {
              [operator]: 'VCenter'
            },
            attachedClusterUuids: {
              [ZOp.not]: null
            }
          }
        }
        // zsv 版本支持primaryStorage的实际使用率和backupStorage的使用率按照具体资源uuid切换
        if (uuid) {
          if (
            (tableName === 'primaryStorage' && monitorItem === 'actualUsedRate') ||
            (tableName === 'backupStorage' && monitorItem === 'usedRate')
          ) {
            condition['uuid'] = uuid
          }
        }

        capacityZqlObject = {
          tableName: tableName,
          condition: condition,
          replyWithCount: true
        }
      } else {
        // 所有区域查询
        let condition
        if (tableName === 'backupStorage') {
          condition = {
            type: {
              [operator]: 'VCenter'
            },
            __systemTag__: {
              [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
            }
          }
        } else {
          condition = {
            type: {
              [operator]: 'VCenter'
            }
          }
        }

        capacityZqlObject = {
          tableName: tableName,
          condition: condition,
          replyWithCount: true
        }
      }
      const capacityZql = ZQL.stringify(capacityZqlObject)
      const capacityResp = await this.zqlService.call(capacityZql)
      resourceList = capacityResp?.results?.[0]?.inventories

      // 获取全局配置中的主存储的保留容量
      if (tableName === 'primaryStorage') {
        const psReservedCapacityZqlObject = {
          tableName: 'GlobalConfig',
          condition: {
            [ZOp.and]: {
              category: 'primaryStorage',
              name: 'reservedCapacity'
            }
          }
        }
        const { results } = await this.zqlService.call(ZQL.stringify(psReservedCapacityZqlObject))
        const psReservedCapacityResp = results?.[0]?.inventories?.[0]
        reservedCapacity = psReservedCapacityResp?.value || psReservedCapacityResp?.defaultValue
      }

      // 获取资源配置中的镜像服务器的保留容量
      if (tableName === 'backupStorage') {
        const tasks = resourceList
          ?.map(bs => bs?.uuid)
          ?.map(async uuid =>
            this.getResourceConfigAction.call({
              name: 'reservedCapacity',
              category: 'backupStorage',
              resourceUuid: uuid
            })
          )
        const bsReservedCapacityResult = await Promise.all(tasks)
        reservedCapacity =
          _.reduce(
            bsReservedCapacityResult,
            (sum, item) => {
              const value = item?.effectiveConfigs?.[0]?.value || item?.value
              sum +=
                value && ['string', 'number'].includes(typeof value) ? Number(parseSize(value)) : 0
              return sum
            },
            0
          ) ?? 0
      }

      if (resourceList?.length) {
        totalCapacity = resourceList.reduce((sum, current) => {
          if (current?.totalCapacity) {
            return sum + current?.totalCapacity
          }
          return sum
        }, 0)
        availableCapacity = resourceList.reduce((sum, current) => {
          if (current?.availableCapacity) {
            return sum + current?.availableCapacity
          }
          return sum
        }, 0)
        // 主存储物理容量
        if (resourceKey === 'primaryStorage') {
          totalPhysicalCapacity = resourceList.reduce((sum, current) => {
            if (current?.totalPhysicalCapacity) {
              return sum + current?.totalPhysicalCapacity
            }
            return sum
          }, 0)
          availablePhysicalCapacity = resourceList.reduce((sum, current) => {
            if (current?.availablePhysicalCapacity) {
              return sum + current?.availablePhysicalCapacity
            }
            return sum
          }, 0)
        }
      }

      if (totalCapacity === 0) {
        usedCapacity = 0
      } else {
        if (resourceKey === 'primaryStorage') {
          usedPhysicalCapacity = totalPhysicalCapacity - availablePhysicalCapacity
          totalCapacity = totalPhysicalCapacity - resourceList?.length * parseSize(reservedCapacity)
          usedCapacity = totalCapacity - availableCapacity
        } else {
          usedCapacity = totalCapacity - availableCapacity + parseSize(reservedCapacity)
          availableCapacity = totalCapacity - usedCapacity
        }
      }
    }

    // 内存和CPU
    if (['MemoryUsedInPercent', 'CPUAllUsedUtilization'].includes(metricName)) {
      if (currentIdentity === 'Normal') {
        // 普通账户
        const { usages = [] } = await this.getAccountQuotaUsageAction.call({
          uuid: accountUuid
        })
        usages?.map(it => {
          if (resourceKey === 'cpu' && it.name === 'vm.cpuNum') {
            totalCapacity = it.total
            usedCapacity = it.used
          }
          if (resourceKey === 'memory' && it.name === 'vm.memorySize') {
            totalCapacity = it.total
            usedCapacity = it.used
          }
        })
      } else {
        // 非普通账户
        const clusterResp = await this.getClusters(zoneKey && zoneUuid, hypervisorType)
        const clusterUuids = clusterResp?.results?.[0]?.inventories?.map(item => item.uuid)
        const {
          availableCpu,
          availableMemory,
          totalCpu,
          totalMemory,
          managedCpuNum = 0
        } = clusterUuids.length > 0
          ? await this.getCpuMemoryCapacityAction.call({
              clusterUuids: clusterUuids
            })
          : {
              availableCpu: 0,
              availableMemory: 0,
              totalCpu: 0,
              totalMemory: 0,
              managedCpuNum: 0
            }
        // 获取当前区域所有物理机的保留内存
        const totalReservedMemory = await this.getHosts(clusterUuids)
        if (metricName === 'MemoryUsedInPercent') {
          if (monitorItem === 'actualUsedRate') {
            // 实际使用率
            totalCapacity = totalMemory
            usedCapacity = totalMemory - availableMemory
          } else {
            // zsv分配比，总量需要减去所有物理机的保留内存
            totalCapacity = totalMemory - totalReservedMemory
            usedCapacity = totalCapacity - availableMemory
          }
        }
        if (metricName === 'CPUAllUsedUtilization') {
          if (monitorItem === 'allocation') {
            // zsv分配比
            totalCapacity = managedCpuNum
            usedCapacity = totalCpu - availableCpu
          }
        }
        // zsv处理CPU和内存的实际使用率
        if (monitorItem === 'actualUsedRate') {
          const res = await this.capacityCalculationQueryService.getHostCpuMemoryCapacity({
            zoneUuids: [zoneUuid]
          })
          if (metricName === 'CPUAllUsedUtilization') {
            totalCapacity = res?.totalCpuGHz
            usedPercent = res?.CPUAllUsedUtilization
          }
          if (metricName === 'MemoryUsedInPercent') {
            totalCapacity = res?.totalPhysicalMemory
            usedCapacity = res?.MemoryUsedBytes
          }
        }
      }
    }

    // 存储容量和镜像容量
    if (['imageSize', 'storageSize'].includes(resourceKey)) {
      const { usages = [] } = await this.getAccountQuotaUsageAction.call({
        uuid: accountUuid
      })
      usages?.map(it => {
        if (resourceKey === 'imageSize' && it.name === 'image.size') {
          totalCapacity = it.total
          usedCapacity = it.used
        }
        if (resourceKey === 'storageSize' && it.name === 'volume.capacity') {
          totalCapacity = it.total
          usedCapacity = it.used
        }
      })
    }

    return {
      usedPhysicalCapacity,
      availablePhysicalCapacity,
      totalPhysicalCapacity,
      totalCapacity,
      availableCapacity,
      usedCapacity: totalCapacity === 0 || usedCapacity < 0 ? 0 : usedCapacity,
      usedPercent: usedPercent <= 0 ? 0 : usedPercent
    }
  }

  // 获得集群
  getClusters = async (zoneUuid = '', hypervisorType = 'kvm') => {
    const baseCondition = {
      hypervisorType: {
        [hypervisorType === 'kvm' ? ZOp.ne : ZOp.eq]: 'ESX',
        [ZOp.notIn]: ['baremetal2']
      }
    }
    const clusterZqlObject = {
      tableName: 'cluster',
      fields: ['uuid'],
      condition: zoneUuid
        ? {
            zoneUuid,
            ...baseCondition
          }
        : baseCondition
    }
    const zql = ZQL.stringify(clusterZqlObject)
    const resp = await this.zqlService.call(zql)
    return resp
  }

  // 获得指定集群内的所有启用并且已连接的物理机的保留内存
  getHosts = async (clusterUuids = []) => {
    const hostZqlObject = {
      tableName: 'host',
      fields: ['uuid'],
      condition: {
        clusterUuid: {
          [ZOp.in]: clusterUuids
        },
        state: 'Enabled',
        status: 'Connected'
      }
    }
    const {
      results: [{ inventories: hostList = [] }]
    } = await this.zqlService.call(ZQL.stringify(hostZqlObject))

    const tasks = hostList
      ?.map(it => it?.uuid)
      ?.map(async uuid =>
        this.getResourceConfigAction.call({
          name: 'reservedMemory',
          category: 'kvm',
          resourceUuid: uuid
        })
      )
    const hostReservedMemoryResult: GetResourceConfigResult[] = await Promise.all(tasks)
    const totalReservedMemory =
      _.reduce(
        hostReservedMemoryResult,
        (sum, item) => {
          const value = item?.effectiveConfigs?.[0]?.value || item?.value
          sum += parseSize(value) ?? 0
          return sum
        },
        0
      ) ?? 0
    return totalReservedMemory ?? 0
  }
}
