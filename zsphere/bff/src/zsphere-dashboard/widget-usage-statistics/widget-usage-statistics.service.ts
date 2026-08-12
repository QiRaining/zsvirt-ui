import { Inject, Injectable } from '@nestjs/common'
import { words } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetAccountQuotaUsageAction } from '@/api/zstack/GetAccountQuotaUsageAction'
import { GetCpuMemoryCapacityAction } from '@/api/zstack/GetCpuMemoryCapacityAction'
import { GetIpAddressCapacityAction } from '@/api/zstack/GetIpAddressCapacityAction'
import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'
import { Cache, CacheService } from '@/common/cache'
import { HostState, HostStatus } from '@/common/enum'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

export const parseSize = (sizeStr: number) => {
  if (words(String(sizeStr))?.length < 2) {
    return sizeStr
  }
  const _sizeStr = String(sizeStr)?.toLowerCase()

  // const unitMap = ['b', 'k', 'm', 'g', 't']
  const unit = sizeStr[_sizeStr.length - 1]?.toLowerCase()
  const size = parseInt(_sizeStr.split(unit)[0], 10)

  let sizeToB = 0
  switch (unit) {
    case 'b':
      sizeToB = size
      break
    case 'k':
      sizeToB = size * 1024
      break
    case 'm':
      sizeToB = size * 1024 * 1024
      break
    case 'g':
      sizeToB = size * 1024 * 1024 * 1024
      break
    case 't':
      sizeToB = size * 1024 * 1024 * 1024 * 1024
      break
    default:
      sizeToB = 0
      break
  }
  return sizeToB
}
@Injectable()
export class WidgetUsageStatisticsService {
  @Inject() zqlService: ZQLService
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() getCpuMemoryCapacityAction: GetCpuMemoryCapacityAction
  @Inject() getIpAddressCapacityAction: GetIpAddressCapacityAction
  @Inject() getAccountQuotaUsageAction: GetAccountQuotaUsageAction
  @Inject() private cacheService: CacheService

  @Cache<any>({ ttl: 9 })
  async getMetricData(queryArgs) {
    return this._getZwatchData({ ...queryArgs })
  }

  _getZwatchData = async ({
    tableName,
    resourceKey,
    monitorItem,
    zoneKey = 'zoneUuid',
    zoneUuid,
    metricName = '',
    accountUuid = '',
    currentIdentity = '',
    hypervisorType = 'kvm'
  }) => {
    // 获取容量
    const {
      usedPercent,
      totalCapacity,
      usedCapacity,
      totalPhysicalCapacity,
      usedPhysicalCapacity
    } = await this.getCapacityStatistics({
      tableName,
      zoneKey,
      zoneUuid,
      resourceKey,
      monitorItem,
      metricName,
      accountUuid,
      currentIdentity,
      hypervisorType
    })

    // 主存储实际使用率
    if (resourceKey === 'primaryStorage' && monitorItem === 'actualUsedRate') {
      return {
        capacityData: {
          totalCapacity: totalPhysicalCapacity,
          usedCapacity: usedPhysicalCapacity
        }
      }
    }

    return {
      capacityData: {
        totalCapacity,
        usedCapacity,
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
    hypervisorType = 'kvm'
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

      // 获取全局配置中镜像服务器/主存储的保留容量
      const reservedCapacityZqlObject = {
        tableName: 'GlobalConfig',
        condition: {
          [ZOp.and]: {
            category: tableName,
            name: 'reservedCapacity'
          }
        }
      }
      const { results } = await this.zqlService.call(ZQL.stringify(reservedCapacityZqlObject))
      const reservedCapacityResp = results?.[0]?.inventories?.[0]
      reservedCapacity = reservedCapacityResp?.value || reservedCapacityResp?.defaultValue

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
          usedCapacity =
            totalCapacity - availableCapacity + resourceList?.length * parseSize(reservedCapacity)
        } else {
          usedCapacity =
            totalCapacity - availableCapacity + resourceList?.length * parseSize(reservedCapacity)
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
        if (metricName === 'MemoryUsedInPercent') {
          totalCapacity = totalMemory
          usedCapacity = totalMemory - availableMemory
        }
        if (metricName === 'CPUAllUsedUtilization') {
          totalCapacity = totalCpu
          usedCapacity = totalCpu - availableCpu
        }

        // 处理实际使用率
        if (monitorItem === 'actualUsedRate') {
          let condition: any = {
            hypervisorType: {
              [ZOp.notIn]: ['baremetal2']
            }
          }
          if (metricName === 'MemoryUsedInPercent') {
            condition = {
              [ZOp.and]: {
                hypervisorType: {
                  [ZOp.notIn]: ['baremetal2']
                },
                state: HostState.Enabled,
                status: HostStatus.Connected
              }
            }
          }
          if (zoneKey && zoneUuid) {
            condition[zoneKey] = zoneUuid
          }
          const zqlObject = {
            tableName: 'host',
            fields: ['uuid'],
            condition,
            returnWith: {
              zwatch: [
                {
                  resultName: 'cpuPercentResult',
                  metricName: 'CPUAllUsedUtilization',
                  offsetAheadOfCurrentTime: 1,
                  functions: ['aggr(op="avg")']
                },
                {
                  resultName: 'memoryPercentResult',
                  metricName: 'MemoryUsedInPercent',
                  offsetAheadOfCurrentTime: 1,
                  functions: ['aggr(op="avg")']
                },
                {
                  resultName: 'memoryFreeBytesResult',
                  metricName: 'MemoryFreeBytes',
                  offsetAheadOfCurrentTime: 1,
                  functions: ['aggr(op="sum")']
                }
              ]
            }
          }
          const zql = ZQL.stringify(zqlObject)
          const resp = await this.zqlService.call(zql)
          const {
            results: [
              {
                returnWith: {
                  cpuPercentResult = [],
                  memoryPercentResult = [],
                  memoryFreeBytesResult = []
                }
              }
            ]
          } = resp
          if (resourceKey === 'cpu') {
            usedPercent = cpuPercentResult?.[0]?.value || 0
            totalCapacity = managedCpuNum
          }
          if (resourceKey === 'memory') {
            usedPercent = memoryPercentResult?.[0]?.value || 0
            usedCapacity = totalCapacity - memoryFreeBytesResult?.[0]?.value
          }
        }
      }
    }

    // 公网/私网/IPV6/IPV4
    if (resourceKey.includes('Network')) {
      const l3NetworkOperator = hypervisorType === 'kvm' ? ZOp.notIn : ZOp.in
      const filterVCenterNetworkObj = {
        [ZOp.query]: {
          tableName: 'L3Network.uuid',
          condition: {
            ['l2Network.cluster.type']: 'vmware'
          }
        }
      }

      const zoneCondition = zoneUuid
        ? {
            zoneUuid
          }
        : {}
      // 公网ip计算
      if (resourceKey === 'publicNetwork') {
        const publicNetworkZqlObject = {
          tableName: 'l3Network',
          condition: {
            system: false,
            category: 'Public',
            uuid: {
              [l3NetworkOperator]: filterVCenterNetworkObj
            },
            ...zoneCondition
          },
          replyWithCount: true
        }
        const { results } = await this.zqlService.call(ZQL.stringify(publicNetworkZqlObject))
        // 公网数量 results?.[0]?.total
        const publicL3Networks = results?.[0]?.inventories
        const publicL3NetworkUuids = publicL3Networks?.map(it => it.uuid)
        if (publicL3NetworkUuids.length > 0) {
          const publicIpCapacity = await this.getIpAddressCapacityAction.call({
            l3NetworkUuids: publicL3NetworkUuids
          })
          if (monitorItem === 'ipv4') {
            totalCapacity = publicIpCapacity?.ipv4TotalCapacity
            usedCapacity =
              publicIpCapacity?.ipv4TotalCapacity - publicIpCapacity?.ipv4AvailableCapacity
          }
          if (monitorItem === 'ipv6') {
            totalCapacity = publicIpCapacity?.ipv6TotalCapacity
            usedCapacity =
              publicIpCapacity?.ipv6TotalCapacity - publicIpCapacity?.ipv6AvailableCapacity
          }
        } else {
          totalCapacity = 0
          usedCapacity = 0
        }
      } else {
        // 私网ip计算
        const privateNetworkZqlObject = {
          tableName: 'l3Network',
          condition: {
            system: false,
            category: 'Private',
            uuid: {
              [l3NetworkOperator]: filterVCenterNetworkObj
            },
            type:
              resourceKey === 'vpcNetwork'
                ? { [ZOp.eq]: 'L3VpcNetwork' }
                : { [ZOp.ne]: 'L3VpcNetwork' },
            ...zoneCondition
          },
          replyWithCount: true
        }
        const privateResp = await this.zqlService.call(ZQL.stringify(privateNetworkZqlObject))
        // 私网数量 results?.[0]?.total
        const privateL3Networks = privateResp?.results?.[0]?.inventories
        const privateL3NetworkUuids = privateL3Networks?.map(it => it.uuid)
        if (privateL3NetworkUuids.length > 0) {
          const privateIpCapacity = await this.getIpAddressCapacityAction.call({
            l3NetworkUuids: privateL3NetworkUuids
          })
          if (monitorItem === 'ipv4') {
            totalCapacity = privateIpCapacity?.ipv4TotalCapacity
            usedCapacity =
              privateIpCapacity?.ipv4TotalCapacity - privateIpCapacity?.ipv4AvailableCapacity
          }
          if (monitorItem === 'ipv6') {
            totalCapacity = privateIpCapacity?.ipv6TotalCapacity
            usedCapacity =
              privateIpCapacity?.ipv6TotalCapacity - privateIpCapacity?.ipv6AvailableCapacity
          }
        } else {
          totalCapacity = 0
          usedCapacity = 0
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
    // gpu
    if (['gpu'].includes(resourceKey)) {
      const extraCondition = zoneUuid
        ? {
            hostUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'host',
                  fields: ['uuid'],
                  condition: {
                    zoneUuid
                  }
                }
              }
            }
          }
        : {}
      const zqlObjects = [
        {
          tableName: 'pcidevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller'],
              ...extraCondition
            }
          }
        },
        {
          tableName: 'pcidevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller'],
              virtStatus: {
                [ZOp.ne]: 'SRIOV_VIRTUAL'
              },
              status: 'Attached',
              ...extraCondition
            }
          }
        },
        {
          tableName: 'pcidevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller'],
              virtStatus: {
                [ZOp.in]: ['VFIO_MDEV_VIRTUALIZED', 'SRIOV_VIRTUALIZED']
              },
              status: 'Attached',
              ...extraCondition
            }
          }
        }
      ]

      const zql = ZQL.multStringify(zqlObjects)
      const { results } = await this.zqlService.call(zql)
      totalCapacity = results?.[0]?.total ?? 0
      usedCapacity = (results?.[1]?.total ?? 0) + (results?.[2]?.total ?? 0)
    }

    // vgpu
    if (['vgpu'].includes(resourceKey)) {
      const extraCondition = zoneUuid
        ? {
            hostUuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'host',
                  fields: ['uuid'],
                  condition: {
                    zoneUuid
                  }
                }
              }
            }
          }
        : {}

      const zqlObjects = [
        {
          tableName: 'mdevDevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller']
            },
            ...extraCondition
          }
        },
        {
          tableName: 'pcidevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller']
            },
            virtStatus: 'SRIOV_VIRTUAL',
            ...extraCondition
          }
        },
        {
          tableName: 'mdevDevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller'],
              status: 'Attached',
              ...extraCondition
            }
          }
        },
        {
          tableName: 'pcidevice',
          action: ZQLAction.COUNT,
          condition: {
            type: {
              [ZOp.in]: ['GPU_Video_Controller', 'GPU_3D_Controller'],
              virtStatus: 'SRIOV_VIRTUAL',
              status: 'Attached',
              ...extraCondition
            }
          }
        }
      ]

      const zql = ZQL.multStringify(zqlObjects)
      const { results } = await this.zqlService.call(zql)
      totalCapacity = (results?.[0]?.total ?? 0) + (results?.[1]?.total ?? 0)
      usedCapacity = (results?.[2]?.total ?? 0) + (results?.[3]?.total ?? 0)
    }

    return {
      usedPhysicalCapacity,
      totalPhysicalCapacity,
      totalCapacity,
      usedCapacity: totalCapacity === 0 ? 0 : usedCapacity,
      usedPercent: usedPercent === 0 ? 0 : usedPercent
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
}
