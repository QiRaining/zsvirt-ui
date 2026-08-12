import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceConfigAction } from '@/api/zstack/GetResourceConfigAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  QueryHostCpuMemoryCapacityArgs,
  QueryLocalStorageHostCapacityArgs,
  QueryPrimaryStorageCapacityArgs
} from '../capacity-calculation.model'

@Injectable()
export class CapacityCalculationQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceConfig: GetResourceConfigAction

  async getHostCpuMemoryCapacity(params) {
    const { zqlCondition, tagCondition, zwatchCondition } = this.buildZqlCondition(params)

    const _resultResp = await this.getHostCpuMemoryCapacityInfo(
      zqlCondition,
      tagCondition,
      zwatchCondition
    )

    return _resultResp
  }

  async getHostCpuMemoryCapacityInfo(
    zqlCondition: ZqlObject['condition'],
    tagCondition: ZqlObject['condition'],
    zwatchCondition: ZqlObject['condition']
  ) {
    const zqlObject = [
      {
        tableName: 'HostCapacity',
        condition: zqlCondition
      },
      {
        tableName: 'SystemTag',
        condition: tagCondition,
        fields: ['resourceUuid', 'tag']
      },
      {
        tableName: 'host',
        fields: ['uuid'],
        condition: zwatchCondition,
        returnWith: {
          zwatch: [
            {
              resultName: 'CPUAllUsedUtilizationResult', // 获取所有host的信息
              metricName: 'CPUAllUsedUtilization',
              offsetAheadOfCurrentTime: 1
            },
            {
              resultName: 'MemoryUsedInPercentResult',
              metricName: 'MemoryUsedInPercent',
              offsetAheadOfCurrentTime: 1,
              functions: ['aggr(op="avg")']
            },
            {
              resultName: 'MemoryFreeBytesResult',
              metricName: 'MemoryFreeBytes',
              offsetAheadOfCurrentTime: 1,
              functions: ['sum()']
            },
            {
              resultName: 'MemoryUsedBytesResult',
              metricName: 'MemoryUsedBytes',
              offsetAheadOfCurrentTime: 1,
              functions: ['sum()']
            }
          ]
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const hostCapacitys = _.get(results, ['0', 'inventories'], [])
    const { hostCpuGHztags = [], hostProcessorNumtagMap = {} } = _.reduce(
      _.get(results, ['1', 'inventories'], []),
      (obj, item) => {
        if (_.includes(item?.tag, 'cpuGHz::')) {
          obj.hostCpuGHztags.push(item)
        }

        if (_.includes(item?.tag, 'cpuProcessorNum::')) {
          _.set(obj.hostProcessorNumtagMap, item.resourceUuid, item)
        }

        return obj
      },
      {
        hostCpuGHztags: [],
        hostProcessorNumtagMap: {}
      }
    )
    const {
      CPUAllUsedUtilizationResult = [],
      MemoryUsedInPercentResult = [],
      MemoryFreeBytesResult = [],
      MemoryUsedBytesResult = []
    } = _.get(results, ['2', 'returnWith'], {
      CPUAllUsedUtilizationResult: [],
      MemoryUsedInPercentResult: [],
      MemoryFreeBytesResult: [],
      MemoryUsedBytesResult: []
    })

    const hostCpuNumMap = {}
    const hostCPUAllUsedUtilizationMap = {}

    let usedCpuGHz = 0
    const resultInfo = {
      hostUuids: [],
      totalMemory: 0,
      availableMemory: 0,
      totalPhysicalMemory: 0,
      availablePhysicalMemory: 0,
      overProvisioningTotalMemory: 0,
      overProvisioningAvailableMemory: 0,
      overProvisioningMemory: 1.0,
      availableCpu: 0,
      totalCpu: 0,
      cpuNum: 0,
      reservedMemory: 0,
      reservedPhysicalMemory: 0,
      cpuSockets: 0,
      totalCpuGHz: 0,
      CPUAllUsedUtilization: 0,
      MemoryUsedInPercent: _.get(MemoryUsedInPercentResult, ['0', 'value'], 0),
      MemoryFreeBytes: _.get(MemoryFreeBytesResult, ['0', 'value'], 0),
      MemoryUsedBytes: _.get(MemoryUsedBytesResult, ['0', 'value'], 0)
    }

    for (const hostCPUAllUsedUtilization of CPUAllUsedUtilizationResult) {
      const _hostUuid = _.get(hostCPUAllUsedUtilization, ['labels', 'HostUuid'])
      _.set(hostCPUAllUsedUtilizationMap, _hostUuid, hostCPUAllUsedUtilization?.value || 0)
    }

    for (const hostCapacity of hostCapacitys) {
      const {
        availableCpu = 0,
        availableMemory = 0,
        availablePhysicalMemory = 0,
        cpuNum = 0,
        cpuSockets = 0,
        totalCpu = 0,
        totalMemory = 0,
        totalPhysicalMemory = 0,
        uuid
      } = hostCapacity

      resultInfo.hostUuids.push(uuid)
      resultInfo.totalMemory += totalMemory
      resultInfo.availableMemory += availableMemory
      resultInfo.totalPhysicalMemory += totalPhysicalMemory
      resultInfo.availablePhysicalMemory += availablePhysicalMemory
      resultInfo.totalCpu += totalCpu
      resultInfo.availableCpu += availableCpu
      resultInfo.cpuNum += cpuNum
      resultInfo.cpuSockets += cpuSockets

      _.set(hostCpuNumMap, uuid, {
        uuid,
        cpuNum: cpuNum,
        ...hostCapacity
      })
    }

    for (const hostCpuGHztag of hostCpuGHztags) {
      const { resourceUuid, tag } = hostCpuGHztag
      const cpuGHz = _.toNumber(_.replace(tag, 'cpuGHz::', ''))
      const cpuProcessorNum = _.toNumber(
        _.replace(_.get(hostProcessorNumtagMap, [resourceUuid, 'tag']), 'cpuProcessorNum::', '')
      )
      const cpuNum = cpuProcessorNum || _.get(hostCpuNumMap, [resourceUuid, 'cpuNum'], 1)
      const totalCpuGHz = cpuGHz * cpuNum

      usedCpuGHz += totalCpuGHz * (_.get(hostCPUAllUsedUtilizationMap, resourceUuid, 0) / 100)

      resultInfo.totalCpuGHz += totalCpuGHz
    }

    resultInfo.CPUAllUsedUtilization = (usedCpuGHz / (resultInfo.totalCpuGHz || 1)) * 100

    const B = 1
    const K = B * 1024
    const M = K * K
    const G = M * K
    const T = G * K

    const obj = {
      B: B,
      K: K,
      M: M,
      G: G,
      T: T
    }

    // 计算物理保留内存
    await Promise.allSettled(
      _.map(_.get(resultInfo, 'hostUuids', []), async hostUuid => {
        try {
          // 保留内存
          const reservedMemoryResp = await this.getResourceConfig.call({
            name: 'reservedMemory',
            category: 'kvm',
            resourceUuid: hostUuid
          })

          // 内存超分率
          const overProvisioningResp = await this.getResourceConfig.call({
            name: 'overProvisioning.memory',
            category: 'mevoco',
            resourceUuid: hostUuid
          })

          const value = _.get(reservedMemoryResp, 'value', '1G')
          const [_number, _unit = 'B'] = _.words(value)

          const reservedPhysicalMemory = _.toNumber(_.get(obj, _unit, 1) * _.toNumber(_number))

          const overProvisioning = _.toNumber(_.get(overProvisioningResp, 'value', '1.0'))

          resultInfo.overProvisioningMemory = overProvisioning

          resultInfo.reservedPhysicalMemory += reservedPhysicalMemory
          resultInfo.reservedMemory += reservedPhysicalMemory * overProvisioning
          resultInfo.overProvisioningTotalMemory +=
            overProvisioning * _.get(hostCpuNumMap, [hostUuid, 'totalMemory'], 0)
          resultInfo.overProvisioningAvailableMemory +=
            overProvisioning * _.get(hostCpuNumMap, [hostUuid, 'availableMemory'], 0)
        } catch (error) {
        } finally {
          return Promise.resolve()
        }
      })
    )

    return resultInfo
  }

  buildZqlCondition(params: QueryHostCpuMemoryCapacityArgs) {
    const { zoneUuids = [], clusterUuids = [], hostUuids = [] } = params

    let zqlCondition: ZqlObject['condition']
    let zwatchCondition: ZqlObject['condition']
    const tagCondition: ZqlObject['condition'] = {
      resourceType: 'HostVO',
      [ZOp.or]: [
        {
          tag: {
            [ZOp.like]: 'cpuGHz::'
          }
        },
        {
          tag: {
            [ZOp.like]: 'cpuProcessorNum::'
          }
        }
      ]
    }

    if (zoneUuids?.length > 0) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['uuid'],
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        }
      }
      zwatchCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['uuid'],
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        }
      }
      _.set(tagCondition, 'resourceUuid', {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'Host',
            fields: ['uuid'],
            condition: {
              zoneUuid: {
                [ZOp.in]: zoneUuids
              }
            }
          }
        }
      })
    } else if (clusterUuids?.length > 0) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['uuid'],
              condition: {
                clusterUuid: {
                  [ZOp.in]: clusterUuids
                }
              }
            }
          }
        }
      }
      zwatchCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'Host',
              fields: ['uuid'],
              condition: {
                clusterUuid: {
                  [ZOp.in]: clusterUuids
                }
              }
            }
          }
        }
      }
      _.set(tagCondition, 'resourceUuid', {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'Host',
            fields: ['uuid'],
            condition: {
              clusterUuid: {
                [ZOp.in]: clusterUuids
              }
            }
          }
        }
      })
    } else if (hostUuids?.length > 0) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: hostUuids
        }
      }
      zwatchCondition = {
        uuid: {
          [ZOp.in]: hostUuids
        }
      }
      _.set(tagCondition, 'resourceUuid', {
        [ZOp.in]: hostUuids
      })
    }

    return {
      zqlCondition,
      tagCondition,
      zwatchCondition
    }
  }

  // 查询数据存储类型
  async getPrimaryStorageType(uuids: string[]) {
    const zql = ZQL.multStringify([
      {
        tableName: 'PrimaryStorage',
        fields: ['uuid', 'type'],
        condition: {
          uuid: { [ZOp.in]: uuids }
        }
      }
    ])
    const { results } = await this.zqlService.call(zql)
    return _.reduce(
      results[0].inventories,
      (acc, item) => {
        acc[item.uuid] = item.type // 假设 type 字段存在
        return acc
      },
      {}
    )
  }

  // 查询虚拟机模版的VolumeUuid
  async getVmTemplateVolumeUuids({ zoneUuids = [], primaryStorageUuids = [] }) {
    const primaryStorageZqlObj =
      primaryStorageUuids?.length > 0
        ? {
            primaryStorageUuid: {
              [ZOp.in]: primaryStorageUuids
            }
          }
        : {
            'primaryStorage.zoneUuid': {
              [ZOp.in]: zoneUuids
            }
          }

    const zqlObject = {
      tableName: 'volume',
      fields: ['uuid'],
      condition: {
        [ZOp.or]: [
          {
            [ZOp.and]: [
              {
                vmInstanceUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'templatedVmInstance',
                      fields: ['uuid']
                    }
                  }
                }
              },
              {
                ...primaryStorageZqlObj
              }
            ]
          },
          {
            [ZOp.and]: [
              {
                vmInstanceUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'templatedVmInstanceCache',
                      fields: ['cacheVmInstanceUuid']
                    }
                  }
                }
              },
              {
                ...primaryStorageZqlObj
              }
            ]
          }
        ]
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    return _.uniq(_.get(results, ['0', 'inventories'], []).map(it => it.uuid))
  }

  async getPrimaryStorageCapacity(params: QueryPrimaryStorageCapacityArgs) {
    // 主存储并没有该资源配置，所以查询全局配置即可
    // name=threshold.primaryStorage.physicalCapacity category=mevoco 主存储使用阈值, 物理的需要用这个API
    // category=primaryStorage name=reservedCapacity 主存储保留容量, 虚拟的需要用这个API

    const { zoneUuids = [], primaryStorageUuids = [] } = params

    // 查询虚拟机模版的VolumeUuid
    const vmTemplateVolumeUuids = await this.getVmTemplateVolumeUuids({
      zoneUuids,
      primaryStorageUuids
    })

    let zqlCondition = {}
    let volumeSizeZql = {}
    let volumeSnapshotZql = {}
    let imagecacheZql = {}
    let vmTemplateVolumeCacheZql = {}
    let localStorageHostZql = {}
    let cephPrimaryStoragePoolZql = {}

    if (zoneUuids?.length > 0) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: ['uuid'],
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        }
      }
      volumeSizeZql = {
        'primaryStorage.zoneUuid': {
          [ZOp.in]: zoneUuids
        }
      }
      volumeSnapshotZql = {
        'primaryStorage.zoneUuid': {
          [ZOp.in]: zoneUuids
        }
      }
      imagecacheZql = {
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        }
      }
      vmTemplateVolumeCacheZql = {
        volumeUuid: {
          [ZOp.in]: vmTemplateVolumeUuids
        }
      }
      localStorageHostZql = {
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        }
      }
      cephPrimaryStoragePoolZql = {
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: {
                  [ZOp.in]: zoneUuids
                }
              }
            }
          }
        },
        type: 'Data'
      }
    } else if (primaryStorageUuids?.length > 0) {
      zqlCondition = {
        uuid: {
          [ZOp.in]: primaryStorageUuids
        }
      }
      volumeSizeZql = {
        primaryStorageUuid: {
          [ZOp.in]: primaryStorageUuids
        }
      }
      volumeSnapshotZql = {
        primaryStorageUuid: {
          [ZOp.in]: primaryStorageUuids
        }
      }
      imagecacheZql = {
        primaryStorageUuid: {
          [ZOp.in]: primaryStorageUuids
        }
      }
      vmTemplateVolumeCacheZql = {
        volumeUuid: {
          [ZOp.in]: vmTemplateVolumeUuids
        }
      }
      localStorageHostZql = {
        primaryStorageUuid: {
          [ZOp.in]: primaryStorageUuids
        }
      }
      cephPrimaryStoragePoolZql = {
        primaryStorageUuid: {
          [ZOp.in]: primaryStorageUuids
        },
        type: 'Data'
      }
    }

    const zqlObject = [
      {
        tableName: 'PrimaryStorageCapacity',
        condition: zqlCondition
      },
      {
        tableName: 'GlobalConfig',
        condition: {
          [ZOp.or]: [
            {
              // 保留容量， 不是集群资源配置，也不是主存储资源配置，所以查询的全局配置
              name: 'reservedCapacity',
              category: 'primaryStorage'
            },
            {
              // 超分率
              name: 'threshold.primaryStorage.physicalCapacity',
              category: 'mevoco'
            }
          ]
        }
      },
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'type',
        condition: volumeSizeZql
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: volumeSnapshotZql
      },
      {
        tableName: 'Imagecache',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'mediaType',
        condition: imagecacheZql
      },
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['actualSize'],
        sumBy: 'type',
        condition: volumeSizeZql
      },
      {
        tableName: 'LocalStorageHostRef',
        action: ZQLAction.COUNT,
        groupBy: 'primaryStorageUuid',
        condition: localStorageHostZql
      },
      {
        tableName: 'CephPrimaryStoragePool',
        action: ZQLAction.QUERY,
        fields: ['totalCapacity', 'usedCapacity', 'primaryStorageUuid'],
        condition: cephPrimaryStoragePoolZql
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: vmTemplateVolumeCacheZql
      }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const [
      primaryStorageCapacityResult,
      globalConfigResult,
      volumeResultRaw,
      volumeSnapshotResultRaw,
      imagecacheResultRaw,
      volumeActualSizeResultRaw,
      primaryStorageHostResultRaw,
      cephPrimaryStoragePoolResultRaw,
      vmTemplateCacheResultRaw
    ] = results

    const primaryStorageCapacitys = _.get(primaryStorageCapacityResult, 'inventories', [])
    const globalConfigs = _.get(globalConfigResult, 'inventories', [])
    const volumeResult = _.get(volumeResultRaw, 'inventories', [])
    const volumeSnapshotResult = _.get(volumeSnapshotResultRaw, 'inventories', [])
    const imagecacheResult = _.get(imagecacheResultRaw, 'inventories', [])
    const volumeActualSizeResult = _.get(volumeActualSizeResultRaw, 'inventories', [])
    const primaryStorageHostResult = _.get(primaryStorageHostResultRaw, 'inventoryCounts', [])

    // 格式 :[{"totalCapacity":107374182400,"usedCapacity":0,"primaryStorageUuid":"37ed75ba759446c4933ee90ad4d17aeb"}]
    const cephPrimaryStoragePoolResult = _.get(cephPrimaryStoragePoolResultRaw, 'inventories', [])
    const vmTemplateCacheResult = _.get(vmTemplateCacheResultRaw, 'inventories', [])

    const volumeSize = _.reduce(
      volumeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeActualSize = _.reduce(
      volumeActualSizeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeSnapshotSize = _.reduce(
      volumeSnapshotResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const imageCacheSize = _.reduce(
      imagecacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const vmTemplateVolumeCacheSize = _.reduce(
      vmTemplateCacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const localStorageHostMap = _.reduce(
      primaryStorageHostResult,
      (obj, it) => {
        const [ps, total = 1] = it
        obj[ps?.primaryStorageUuid] = total
        return obj
      },
      {} as { [key: string]: number }
    )

    const cephPrimaryStoragePoolMap = _.reduce(
      cephPrimaryStoragePoolResult,
      (obj, it) => {
        const { primaryStorageUuid } = it
        obj[primaryStorageUuid] = (obj[primaryStorageUuid] || 0) + 1
        return obj
      },
      {} as { [key: string]: number }
    )

    const cephTotalPhysicalCapacity = _.reduce(
      cephPrimaryStoragePoolResult,
      (size, it) => {
        const { totalCapacity = 0 } = it
        size += totalCapacity
        return size
      },
      0
    )

    const cephAvailablePhysicalCapacity = _.reduce(
      cephPrimaryStoragePoolResult,
      (size, it) => {
        const { totalCapacity = 0, usedCapacity = 0 } = it
        size += totalCapacity - usedCapacity
        return size
      },
      0
    )

    const thresholdPrimaryStoragePhysicalCapacity = _.toNumber(
      _.get(
        _.find(globalConfigs, {
          name: 'threshold.primaryStorage.physicalCapacity',
          category: 'mevoco'
        }),
        'value',
        '0.9'
      )
    )

    const primaryStorageReservedCapacity = _.get(
      _.find(globalConfigs, {
        name: 'reservedCapacity',
        category: 'primaryStorage'
      }),
      'value',
      '1G'
    )

    const [_number, _unit = 'B'] = _.words(primaryStorageReservedCapacity)

    const B = 1
    const K = B * 1024
    const M = K * K
    const G = M * K
    const T = G * K

    const obj = {
      B: B,
      K: K,
      M: M,
      G: G,
      T: T
    }

    const primaryStorageReservedCapacityValue = _.toNumber(
      _.get(obj, _unit, 1) * _.toNumber(_number)
    )

    const resultInfo = {
      primaryStorageUuids: [],
      availableCapacity: 0,
      reservedCapacity: 0,
      totalCapacity: 0,
      availablePhysicalCapacity: 0,
      reservedPhysicalCapacity: 0,
      totalPhysicalCapacity: 0,
      systemUsedCapacity: 0,
      overProvisioningPrimaryStorage: 1.0,
      thresholdPrimaryStoragePhysicalCapacity,
      // 原因：模版创建虚拟机时，会出现快照容量，需要剔除
      volumeSnapshotSize: volumeSnapshotSize - vmTemplateVolumeCacheSize,
      imageCacheSize,
      volumeSize,
      vmTemplateVolumeCacheSize,
      volumeActualSize,
      cephTotalPhysicalCapacity: 0,
      cephAvailablePhysicalCapacity: 0
    }

    const primaryStorageTypeMap = await this.getPrimaryStorageType(
      _.map(primaryStorageCapacitys, 'uuid')
    )

    for (const primaryStorageCapacity of primaryStorageCapacitys) {
      const {
        availableCapacity = 0,
        availablePhysicalCapacity = 0,
        systemUsedCapacity = 0,
        totalCapacity = 0,
        totalPhysicalCapacity = 0,
        uuid
      } = primaryStorageCapacity

      resultInfo.primaryStorageUuids.push(uuid)

      const isCephStorage = primaryStorageTypeMap[uuid] === 'Ceph'

      // 如果是ceph存储数据源为cephTotalPhysicalCapacity、后续vhost也需要这么处理
      if (isCephStorage) {
        // 数据源为ceph
        resultInfo.availablePhysicalCapacity += cephAvailablePhysicalCapacity
        resultInfo.totalPhysicalCapacity += cephTotalPhysicalCapacity

        // 其他
        resultInfo.availableCapacity += availableCapacity
        resultInfo.systemUsedCapacity += systemUsedCapacity
        resultInfo.totalCapacity += totalCapacity

        // 全局配置：每个主存储阈值计算得出的保留容量 (ceph存储总量的数据源需要单独处理)
        resultInfo.reservedPhysicalCapacity +=
          cephTotalPhysicalCapacity * (1 - thresholdPrimaryStoragePhysicalCapacity)
      } else {
        resultInfo.totalPhysicalCapacity += totalPhysicalCapacity
        resultInfo.availablePhysicalCapacity += availablePhysicalCapacity

        // 其他
        resultInfo.availableCapacity += availableCapacity
        resultInfo.systemUsedCapacity += systemUsedCapacity
        resultInfo.totalCapacity += totalCapacity

        // 全局配置：每个主存储阈值计算得出的保留容量
        resultInfo.reservedPhysicalCapacity +=
          totalPhysicalCapacity * (1 - thresholdPrimaryStoragePhysicalCapacity)
      }

      const hostCount = _.get(localStorageHostMap, uuid, 0)
      const cephPoolCount = _.get(cephPrimaryStoragePoolMap, uuid, 0)

      // 全局配置：每个主存储保留容量 (本地存储计算了了N个HOST)、(ceph存储计算了N个pool)
      const totalStorageCount = Math.max(hostCount, cephPoolCount, 1)

      resultInfo.reservedCapacity += totalStorageCount * primaryStorageReservedCapacityValue
    }

    // 计算存储超分率
    await Promise.allSettled(
      _.map(_.get(resultInfo, 'primaryStorageUuids', []), async primaryStorageUuid => {
        try {
          // 存储超分率
          const overProvisioningResp = await this.getResourceConfig.call({
            name: 'overProvisioning.primaryStorage',
            category: 'mevoco',
            resourceUuid: primaryStorageUuid
          })

          const overProvisioning = _.toNumber(_.get(overProvisioningResp, 'value', '1.0'))

          resultInfo.overProvisioningPrimaryStorage = overProvisioning
        } catch (error) {
        } finally {
          return Promise.resolve()
        }
      })
    )

    return resultInfo
  }

  async getLocalStorageHostCapacity(params: QueryLocalStorageHostCapacityArgs) {
    // 主存储并没有该资源配置，所以查询全局配置即可
    // name=threshold.primaryStorage.physicalCapacity category=mevoco 主存储使用阈值, 物理的需要用这个API

    const { hostUuid, primaryStorageUuid } = params

    const { results: primaryStorageHostRefResult } = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'LocalStorageHostRef',
        fields: ['primaryStorageUuid'],
        condition: {
          hostUuid
        }
      })
    )
    const _primaryStorageUuid = _.get(
      primaryStorageHostRefResult,
      ['0', 'inventories', '0', 'primaryStorageUuid'],
      ''
    )

    const realPrimaryStorageUuid = primaryStorageUuid || _primaryStorageUuid

    const vmTemplateVolumeUuids = await this.getVmTemplateVolumeUuids({
      primaryStorageUuids: [realPrimaryStorageUuid]
    })

    const zqlCondition = {
      hostUuid: hostUuid
    }

    const volumeSizeZql = {
      'localStorageHostRef.hostUuid': hostUuid,
      'primaryStorage.type': 'LocalStorage'
    }

    const volumeSnapshotZql = {
      'localStorageHostRef.hostUuid': hostUuid,
      'primaryStorage.type': 'LocalStorage'
    }

    const vmTemplateVolumeCacheZql = {
      'localStorageHostRef.hostUuid': hostUuid,
      'primaryStorage.type': 'LocalStorage',
      volumeUuid: {
        [ZOp.in]: vmTemplateVolumeUuids
      }
    }

    if (realPrimaryStorageUuid) {
      _.set(zqlCondition, 'primaryStorageUuid', realPrimaryStorageUuid)
      _.set(volumeSizeZql, 'primaryStorageUuid', realPrimaryStorageUuid)
      _.set(volumeSnapshotZql, 'primaryStorageUuid', realPrimaryStorageUuid)
      _.set(vmTemplateVolumeCacheZql, 'primaryStorageUuid', realPrimaryStorageUuid)
    }

    const zqlObject = [
      {
        tableName: 'LocalStorageHostRef',
        condition: zqlCondition
      },
      {
        tableName: 'GlobalConfig',
        condition: {
          [ZOp.or]: [
            {
              // 保留容量， 不是集群资源配置，也不是主存储资源配置，所以查询的全局配置
              name: 'reservedCapacity',
              category: 'primaryStorage'
            },
            {
              // 超分率
              name: 'threshold.primaryStorage.physicalCapacity',
              category: 'mevoco'
            }
          ]
        }
      },
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'type',
        condition: volumeSizeZql
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: volumeSnapshotZql
      },
      {
        tableName: 'Imagecache',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'mediaType',
        condition: {
          installUrl: {
            [ZOp.like]: hostUuid
          },
          primaryStorageUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'LocalStorageHostRef',
                fields: 'primaryStorageUuid',
                condition: {
                  hostUuid
                }
              }
            }
          }
        }
      },
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['actualSize'],
        sumBy: 'type',
        condition: volumeSizeZql
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: vmTemplateVolumeCacheZql
      }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const volumeResult = _.get(results, ['2', 'inventories'], [])
    const volumeSnapshotResult = _.get(results, ['3', 'inventories'], [])
    const imagecacheResult = _.get(results, ['4', 'inventories'], [])
    const volumeActualSizeResult = _.get(results, ['5', 'inventories'], [])
    const vmTemplateVolumeCacheResult = _.get(results, ['6', 'inventories'], [])

    const volumeSize = _.reduce(
      volumeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeActualSize = _.reduce(
      volumeActualSizeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeSnapshotSize = _.reduce(
      volumeSnapshotResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const imageCacheSize = _.reduce(
      imagecacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const vmTemplateVolumeCacheSize = _.reduce(
      vmTemplateVolumeCacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const globalConfigs = _.get(results, ['1', 'inventories'], [])

    const thresholdPrimaryStoragePhysicalCapacity = _.toNumber(
      _.get(
        _.find(globalConfigs, {
          name: 'threshold.primaryStorage.physicalCapacity',
          category: 'mevoco'
        }),
        'value',
        '0.9'
      )
    )

    const primaryStorageReservedCapacity = _.get(
      _.find(globalConfigs, {
        name: 'reservedCapacity',
        category: 'primaryStorage'
      }),
      'value',
      '1G'
    )

    const [_number, _unit = 'B'] = _.words(primaryStorageReservedCapacity)

    const B = 1
    const K = B * 1024
    const M = K * K
    const G = M * K
    const T = G * K

    const _obj = {
      B: B,
      K: K,
      M: M,
      G: G,
      T: T
    }

    const primaryStorageReservedCapacityValue = _.toNumber(
      _.get(_obj, _unit, 1) * _.toNumber(_number)
    )

    // 全局配置：每个主存储保留容量
    // reservedCapacity = primaryStorageReservedCapacityValue

    // 一个host 可能在多个ps上
    const resultInfo = _.reduce(
      _.get(results, ['0', 'inventories'], []),
      (obj, it) => {
        obj = {
          ...obj,
          reservedCapacity: primaryStorageReservedCapacityValue + _.get(obj, 'reservedCapacity', 0),
          availableCapacity: _.get(it, 'availableCapacity', 0) + _.get(obj, 'availableCapacity', 0),
          availablePhysicalCapacity:
            _.get(it, 'availablePhysicalCapacity', 0) + _.get(obj, 'availablePhysicalCapacity', 0),
          totalCapacity: _.get(it, 'totalCapacity', 0) + _.get(obj, 'totalCapacity', 0),
          totalPhysicalCapacity:
            _.get(it, 'totalPhysicalCapacity', 0) + _.get(obj, 'totalPhysicalCapacity', 0),
          systemUsedCapacity:
            _.get(it, 'systemUsedCapacity', 0) + _.get(obj, 'systemUsedCapacity', 0)
        }
        return obj
      },
      {
        hostUuid: hostUuid,
        primaryStorageUuid: '',
        availableCapacity: 0,
        totalCapacity: 0,
        availablePhysicalCapacity: 0,
        reservedPhysicalCapacity: 0,
        totalPhysicalCapacity: 0,
        overProvisioningPrimaryStorage: 1,
        reservedCapacity: 0,
        systemUsedCapacity: 0,
        volumeSnapshotSize: 0,
        imageCacheSize: 0,
        volumeSize: 0,
        volumeActualSize: 0,
        vmTemplateVolumeCacheSize: 0
      }
    )

    resultInfo.volumeSize = volumeSize
    resultInfo.volumeActualSize = volumeActualSize
    // 原因：模版创建虚拟机时，会出现快照容量，需要剔除
    resultInfo.volumeSnapshotSize = volumeSnapshotSize - vmTemplateVolumeCacheSize
    resultInfo.imageCacheSize = imageCacheSize
    resultInfo.vmTemplateVolumeCacheSize = vmTemplateVolumeCacheSize

    // 全局配置：每个主存储阈值计算得出的保留容量
    resultInfo.reservedPhysicalCapacity =
      resultInfo.totalPhysicalCapacity * (1 - thresholdPrimaryStoragePhysicalCapacity)

    try {
      // 存储超分率
      const overProvisioningResp = await this.getResourceConfig.call({
        name: 'overProvisioning.primaryStorage',
        category: 'mevoco',
        resourceUuid: realPrimaryStorageUuid
      })

      const overProvisioning = _.toNumber(_.get(overProvisioningResp, 'value', '1.0'))

      resultInfo.overProvisioningPrimaryStorage = overProvisioning
    } catch (error) {}

    return resultInfo
  }

  /**
   * 获取单个池子的容量
   *   - ceph | vhost | zbs 的池子容量
   * @param params: { primaryStorageUuid: string, poolName: string }
   * @returns
   */
  async getPrimaryStoragePoolCapacity(params: { primaryStorageUuid: string; poolName: string }) {
    const { primaryStorageUuid = '', poolName } = params

    const volumeSizeZql = {
      primaryStorageUuid,
      installPath: {
        [ZOp.like]: `%${poolName}%`
      }
    }

    const volumeSnapshotZql = {
      primaryStorageUuid,
      primaryStorageInstallPath: {
        [ZOp.like]: `%${poolName}%`
      }
    }

    const imagecache = {
      primaryStorageUuid,
      installUrl: {
        [ZOp.like]: `%${poolName}%`
      }
    }

    const volume = {
      primaryStorageUuid,
      installPath: {
        [ZOp.like]: `%${poolName}%`
      }
    }

    const vmTemplateVolumeCacheZql = {
      primaryStorageUuid,
      primaryStorageInstallPath: {
        [ZOp.like]: `%${poolName}%`
      }
    }

    const zqlObject = [
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'type',
        condition: volumeSizeZql
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: volumeSnapshotZql
      },
      {
        tableName: 'Imagecache',
        action: ZQLAction.SUM,
        fields: ['size'],
        sumBy: 'mediaType',
        condition: imagecache
      },
      {
        tableName: 'volume',
        action: ZQLAction.SUM,
        fields: ['actualSize'],
        sumBy: 'type',
        condition: volume
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: vmTemplateVolumeCacheZql
      },
      {
        tableName: 'GlobalConfig',
        condition: {
          name: 'reservedCapacity',
          category: 'primaryStorage'
        }
      }
    ]

    const zql = ZQL.multStringify(zqlObject)
    const { results } = await this.zqlService.call(zql)

    const [
      volumeResultRaw,
      volumeSnapshotResultRaw,
      imagecacheResultRaw,
      volumeActualSizeResultRaw,
      vmTemplateVolumeCacheResultRaw,
      globalConfigResult
    ] = results

    const volumeResult = _.get(volumeResultRaw, 'inventories', [])
    const volumeSnapshotResult = _.get(volumeSnapshotResultRaw, 'inventories', [])
    const imagecacheResult = _.get(imagecacheResultRaw, 'inventories', [])
    const volumeActualSizeResult = _.get(volumeActualSizeResultRaw, 'inventories', [])
    const vmTemplateVolumeCacheResult = _.get(vmTemplateVolumeCacheResultRaw, 'inventories', [])
    const globalConfigs = _.get(globalConfigResult, 'inventories', [])

    const volumeSize = _.reduce(
      volumeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeActualSize = _.reduce(
      volumeActualSizeResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const volumeSnapshotSize = _.reduce(
      volumeSnapshotResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const imageCacheSize = _.reduce(
      imagecacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const vmTemplateVolumeCacheSize = _.reduce(
      vmTemplateVolumeCacheResult,
      (size, it) => {
        const [type, _size = 0] = it
        size += _size
        return size
      },
      0
    )

    const primaryStorageReservedCapacity = _.get(
      _.find(globalConfigs, {
        name: 'reservedCapacity',
        category: 'primaryStorage'
      }),
      'value',
      '1G'
    )

    const [_number, _unit = 'B'] = _.words(primaryStorageReservedCapacity)

    const B = 1
    const K = B * 1024
    const M = K * K
    const G = M * K
    const T = G * K

    const obj = {
      B: B,
      K: K,
      M: M,
      G: G,
      T: T
    }

    const primaryStorageReservedCapacityValue = _.toNumber(
      _.get(obj, _unit, 1) * _.toNumber(_number)
    )

    const resultInfo = {
      volumeActualSize: 0,
      volumeSize: 0,
      volumeSnapshotSize: 0,
      imageCacheSize: 0,
      vmTemplateVolumeCacheSize: 0,
      overProvisioningPrimaryStorage: 1,
      reservedCapacity: 0
    }

    resultInfo.volumeSize = volumeSize
    resultInfo.volumeActualSize = volumeActualSize
    // 原因：模版创建虚拟机时，会出现快照容量，需要剔除
    resultInfo.volumeSnapshotSize = volumeSnapshotSize - vmTemplateVolumeCacheSize
    resultInfo.imageCacheSize = imageCacheSize
    resultInfo.vmTemplateVolumeCacheSize = vmTemplateVolumeCacheSize
    resultInfo.reservedCapacity = primaryStorageReservedCapacityValue //直接读全局设置，这儿是单个的pool池，不做累加
    try {
      // 存储超分率
      const overProvisioningResp = await this.getResourceConfig.call({
        name: 'overProvisioning.primaryStorage',
        category: 'mevoco',
        resourceUuid: primaryStorageUuid
      })

      const overProvisioning = _.toNumber(_.get(overProvisioningResp, 'value', '1.0'))

      resultInfo.overProvisioningPrimaryStorage = overProvisioning
    } catch (error) {}

    return resultInfo
  }
}
