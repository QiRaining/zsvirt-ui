import { Inject, Injectable } from '@nestjs/common'
import { get as _get } from 'lodash'

import { Condition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryMdevDeviceAction } from '@/api/zstack/QueryMdevDeviceAction'
import { QueryPciDeviceAction } from '@/api/zstack/QueryPciDeviceAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import { Cache, CacheService } from '@/common/cache'
import { HostStatus, VolumeStatus, PciDeviceStatus } from '@/common/enum'
import ZQL, { ZQLAction, QueryConditionTranslator, ZOp } from '@/common/zql/index'

import { WidgetResourceStateCountInput } from './widget-resource-state.model'

@Injectable()
export class WidgetResourceStateService {
  @Inject() zqlService: ZQLService
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() queryPciDeviceAction: QueryPciDeviceAction
  @Inject() queryMdevDeviceAction: QueryMdevDeviceAction
  @Inject() private cacheService: CacheService

  // state 类
  async getCountByState(state, params: WidgetResourceStateCountInput) {
    const { conditions, type, hypervisorType = 'kvm' } = params
    let baseConditions: Condition[] = []
    const specicalCondition = []
    let tableName = type
    if (type === 'vmInstance') {
      baseConditions = (
        [
          {
            key: 'type',
            op: Op.eq,
            value: 'UserVm'
          },
          {
            key: 'hypervisorType',
            op: hypervisorType === 'esx' ? Op.eq : Op.ne,
            value: 'ESX'
          },
          {
            key: 'state',
            op: Op.ne,
            value: 'Destroyed'
          }
        ] as Condition[]
      ).concat(conditions)
      specicalCondition.push({
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.and]: {
                  [ZOp.query]: {
                    tableName: 'templatedVminstance',
                    fields: ['uuid']
                  }
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.and]: {
                  [ZOp.query]: {
                    tableName: 'templatedVminstanceCache',
                    fields: ['cacheVmInstanceUuid']
                  }
                }
              }
            }
          }
        ]
      })
    }
    if (params.type === 'vpc') {
      tableName = 'VpcRouterVm'
      baseConditions = (
        [
          {
            key: 'hypervisorType',
            op: Op.ne,
            value: 'ESX'
          }
        ] as Condition[]
      ).concat(conditions)
    }

    switch (state) {
      case 'running':
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          value: 'Running'
        })
        break
      case 'stopped':
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          value: 'Stopped'
        })
        break
      case 'other':
        baseConditions.push({
          key: 'state',
          op: Op.notIn,
          values: ['Running', 'Stopped']
        })
        break
      case 'total':
        break
      default:
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          values: state.charAt(0).toUpperCase() + state.slice(1)
        })
        break
    }

    const zqlObject = {
      tableName: tableName,
      condition: QueryConditionTranslator.translate(baseConditions, specicalCondition),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    return resp.results[0].total
  }

  @Cache<any>({ ttl: 9 })
  async getStateCount(params) {
    return {
      total: (await this.getCountByState('total', params)) || 0,
      running: (await this.getCountByState('running', params)) || 0,
      stopped: (await this.getCountByState('stopped', params)) || 0,
      other: (await this.getCountByState('other', params)) || 0
    }
  }

  // 启用停用类

  async getCountByEnabledAndDisabled(state, params: WidgetResourceStateCountInput) {
    const { conditions, type, hypervisorType } = params
    let baseConditions: Condition[] = []
    let tableName = type
    if (type === 'image') {
      baseConditions = (
        [
          {
            key: 'system',
            op: Op.eq,
            value: 'false'
          },
          {
            key: 'backupStorage.__systemTag__',
            op: Op.ne,
            value: 'remote'
          },
          {
            key: 'status',
            op: Op.ne,
            value: 'Deleted'
          },
          {
            key: 'format',
            op: hypervisorType === 'esx' ? Op.eq : Op.ne,
            value: 'vmtx'
          }
        ] as Condition[]
      ).concat(conditions)
    }
    if (type === 'cluster') {
      baseConditions = (
        [
          hypervisorType === 'esx'
            ? {
                key: 'hypervisorType',
                op: Op.eq,
                value: 'ESX'
              }
            : {
                key: 'hypervisorType',
                op: Op.notIn,
                values: ['ESX', 'baremetal2', 'baremetal']
              }
        ] as Condition[]
      ).concat(conditions)
    }

    if (type === 'hostState') {
      tableName = 'host'
      baseConditions = (
        [
          {
            key: 'hypervisorType',
            op: hypervisorType === 'esx' ? Op.eq : Op.ne,
            value: 'ESX'
          },
          {
            key: 'hypervisorType',
            op: Op.ne,
            value: 'baremetal2'
          }
        ] as Condition[]
      ).concat(conditions)
    }

    switch (state) {
      case 'enabled':
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          value: 'Enabled'
        })
        break
      case 'disabled':
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          value: 'Disabled'
        })
        break
      case 'other':
        baseConditions.push({
          key: 'state',
          op: Op.notIn,
          values: ['Enabled', 'Disabled']
        })
        break
      case 'total':
        break
      default:
        baseConditions.push({
          key: 'state',
          op: Op.eq,
          values: state.charAt(0).toUpperCase() + state.slice(1)
        })
        break
    }

    const zqlObject = {
      tableName: tableName,
      condition: QueryConditionTranslator.translate(baseConditions),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    return resp.results[0].total
  }

  @Cache<any>({ ttl: 9 })
  async getEnabledDisabledCount(params) {
    return {
      total: (await this.getCountByEnabledAndDisabled('total', params)) || 0,
      enabled: (await this.getCountByEnabledAndDisabled('Enabled', params)) || 0,
      disabled: (await this.getCountByEnabledAndDisabled('Disabled', params)) || 0,
      other: (await this.getCountByEnabledAndDisabled('other', params)) || 0
    }
  }

  // status类
  async getCountByStatus(status, params) {
    const { conditions = [] } = params
    const tableName = params.type
    const baseConditons: Condition[] = [...conditions]

    switch (status) {
      case 'connected':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: HostStatus.Connected
        })
        break
      case 'disconnected':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: HostStatus.Disconnected
        })
        break
      case 'other':
        baseConditons.push({
          key: 'status',
          op: Op.notIn,
          values: [HostStatus.Connected, HostStatus.Disconnected]
        })
        break
      case 'total':
        break
      default:
        break
    }
    const zqlObject = {
      tableName: tableName,
      condition: QueryConditionTranslator.translate(baseConditons),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    return resp.results[0].total || 0
  }

  @Cache<any>({ ttl: 9 })
  async getStatusCount(params) {
    return {
      total: (await this.getCountByStatus('total', params)) || 0,
      connected: (await this.getCountByStatus('connected', params)) || 0,
      disconnected: (await this.getCountByStatus('disconnected', params)) || 0,
      other: (await this.getCountByStatus('other', params)) || 0
    }
  }

  // 云盘
  async getVolumeCountByStatus(status, params) {
    const { conditions = [], type } = params
    let baseConditons: Condition[] = []
    switch (status) {
      case 'attached':
        baseConditons = [
          {
            key: 'status',
            op: Op.eq,
            value: VolumeStatus.Ready
          },
          {
            key: 'type',
            value: 'Data',
            op: Op.eq
          },
          {
            key: 'vmInstanceUuid',
            op: Op.not
          }
        ]
        baseConditons = baseConditons.concat(conditions)
        break
      case 'notAttached':
        baseConditons = [
          {
            key: 'status',
            op: Op.eq,
            value: VolumeStatus.Ready
          },
          {
            key: 'type',
            value: 'Data',
            op: Op.eq
          },
          {
            key: 'vmInstanceUuid',
            op: Op.is
          }
        ]
        baseConditons = baseConditons.concat(conditions)
        break
      case 'notInstantiated':
        baseConditons = [
          {
            key: 'status',
            op: Op.eq,
            value: VolumeStatus.NotInstantiated
          },
          {
            key: 'type',
            value: 'Data',
            op: Op.eq
          }
        ]
        break
      case 'total':
        baseConditons = [
          {
            key: 'status',
            op: Op.ne,
            value: VolumeStatus.Deleted
          },
          {
            key: 'type',
            value: 'Data',
            op: Op.eq
          }
        ]
        baseConditons = baseConditons.concat(conditions)
        break
      default:
        break
    }
    const resp = await this.queryVolumeAction.call({
      conditions: baseConditons,
      replyWithCount: true
    })
    return +resp.total || 0
  }

  @Cache<any>({ ttl: 9 })
  async getVolumeStatusCount(params) {
    const total = (await this.getVolumeCountByStatus('total', params)) || 0
    const attached = (await this.getVolumeCountByStatus('attached', params)) || 0
    const notAttached = (await this.getVolumeCountByStatus('notAttached', params)) || 0
    const notInstantiated = (await this.getVolumeCountByStatus('notInstantiated', params)) || 0
    return {
      total: total + notInstantiated,
      attached: attached,
      notAttached: notAttached,
      notInstantiated: notInstantiated
    }
  }

  // GPU
  async getGpuCountByStatus(status, params) {
    const { conditions = [], type } = params
    let baseConditons: Condition[] = []
    switch (status) {
      case 'attached':
        baseConditons = [
          {
            key: 'status',
            op: Op.eq,
            value: PciDeviceStatus.Attached
          }
        ]
        break
      case 'notAttached':
        baseConditons = [
          {
            key: 'status',
            op: Op.in,
            values: [PciDeviceStatus.Active, PciDeviceStatus.System]
          }
        ]
        break
      case 'total':
        break
      default:
        break
    }
    const resp1 = await this.queryPciDeviceAction.call({
      conditions: baseConditons.concat(conditions),
      replyWithCount: true
    })
    if (type === 'virtualGpu') {
      const zoneCondition = conditions?.filter(it => it?.key === 'host.zone.uuid' && it?.value)
      const _baseConditons = zoneCondition?.length
        ? baseConditons.concat(zoneCondition)
        : baseConditons
      const resp2 = await this.queryMdevDeviceAction.call({
        conditions: _baseConditons,
        replyWithCount: true
      })
      return resp1?.total + resp2?.total || 0
    }
    return resp1?.total || 0
  }

  @Cache<any>({ ttl: 9 })
  async getGpuStatusCount(params) {
    const total = (await this.getGpuCountByStatus('total', params)) || 0
    const attached = (await this.getGpuCountByStatus('attached', params)) || 0
    const notAttached = (await this.getGpuCountByStatus('notAttached', params)) || 0
    return {
      total,
      attached,
      notAttached,
      other: total - attached - notAttached
    }
  }
}
