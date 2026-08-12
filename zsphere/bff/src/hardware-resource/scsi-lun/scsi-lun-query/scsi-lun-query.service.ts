import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetHostMultipathTopologyAction } from '@/api/zstack/GetHostMultipathTopologyAction'
import { GetScsiLunCandidatesForAttachingVmAction } from '@/api/zstack/GetScsiLunCandidatesForAttachingVmAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction, ZQLFn } from '@/common/zql/index'

import { LunDeviceMultiPathDetail, ScsiLunQueryType } from '../scsi-lun.model'
import { LunDeviceMultiPathList } from '../scsi-lun.model'

@Injectable()
export class ScsiLunQueryService {
  @Inject() zqlService: ZQLService
  @Inject()
  getScsiLunCandidatesForAttachingVmAction: GetScsiLunCandidatesForAttachingVmAction
  @Inject()
  getHostMultipathTopologyAction: GetHostMultipathTopologyAction

  private healthStateLoader: DataLoader<{ uuid: string; hostUuid: string }, string, string>

  constructor() {
    this.healthStateLoader = new DataLoader(this._queryHealthState, {
      cacheKeyFn: item => `${item.uuid}-${item.hostUuid}`
    })
  }

  async queryList(params: IQueryAction) {
    const { type = ScsiLunQueryType.Normal } = params

    let _resultResp = null
    let _extrazqlConditions = null

    switch (type) {
      case ScsiLunQueryType.Normal:
        break

      case ScsiLunQueryType.GetScsiLunCandidatesForAttachingVm:
        _extrazqlConditions = await this.getScsiLunCandidatesForAttachingVm(params.extraConditions)
        break

      case ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByHost:
        _extrazqlConditions = await this.getScsiLunCandidatesForAttachingZSVInstanceByHost(
          params.extraConditions
        )
        break
      case ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByCluster:
        _extrazqlConditions = await this.getScsiLunCandidatesForAttachingZSVInstanceByCluster(
          params.extraConditions
        )
        break

      case ScsiLunQueryType.GetSharedBlockCandidate:
        _extrazqlConditions = await this.getSharedBlockCandidate(params.extraConditions)
        break
    }

    const zqlCondition = await this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getScsiLunList(params, zqlCondition)

    return _resultResp
  }

  async getScsiLunList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY

    const zqlObject = {
      action,
      tableName: 'ScsiLun',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      groupBy: 'wwid', // 默认根据wwid分组，
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.multStringify([
      zqlObject,
      {
        ..._.omit(zqlObject, ['groupBy', 'returnWith', 'limit', 'offset']), // 去掉groupBy，returnWith，limit，offset， 特别是groupBy，后端zql会报错。
        fnName: ZQLFn.distinct,
        fields: ['wwid'],
        action: ZQLAction.COUNT
      }
    ])

    // const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const scsiLuns = results?.[0]?.inventories ?? []
    const total = results?.[1]?.total ?? 0

    return {
      list: scsiLuns,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[], extrazqlConditions) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'healthState',
      'ownerName',
      '__GetUsedLunByIscsiServerUuids__', // 通过IscsiServer，获取被使用过的iSCSI-LUN
      '__GetUnUsedLunByIscsiServerUuids__', // 通过IscsiServer，获取未被使用过的iSCSI-LUN
      '__GetUsedLunByIscsiTargetUuids__', // 通过iqn，获取被使用过的iSCSI-LUN
      '__GetUnUsedLunByIscsiTargetUuids__' // 通过iqn，获取未被使用过的iSCSI-LUN
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'ScsiLunVO')
      )
    }

    if (_extraConditionMap['__GetUsedLunByIscsiServerUuids__']) {
      const iscsiServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByIscsiServerUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByIscsiServerUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                wwid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SharedBlock',
                      fields: ['diskUuid']
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'ScsiLunVmInstanceRef',
                      fields: ['scsiLunUuid']
                    }
                  }
                }
              }
            ]
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'IscsiLun',
                  fields: ['uuid'],
                  condition: {
                    'iscsiTarget.iscsiServerUuid': {
                      [ZOp.in]: iscsiServerUuids
                    }
                  }
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']) {
      const iscsiServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByIscsiServerUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'IscsiLun',
                  fields: ['uuid'],
                  condition: {
                    'iscsiTarget.iscsiServerUuid': {
                      [ZOp.in]: iscsiServerUuids
                    }
                  }
                }
              }
            }
          },
          {
            wwid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'SharedBlock',
                  fields: ['diskUuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'ScsiLunVmInstanceRef',
                  fields: ['scsiLunUuid']
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUsedLunByIscsiTargetUuids__']) {
      const iscsiTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByIscsiTargetUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByIscsiTargetUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            [ZOp.or]: [
              {
                wwid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'SharedBlock',
                      fields: ['diskUuid']
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'ScsiLunVmInstanceRef',
                      fields: ['scsiLunUuid']
                    }
                  }
                }
              }
            ]
          },
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'IscsiLun',
                  fields: ['uuid'],
                  condition: {
                    iscsiTargetUuid: {
                      [ZOp.in]: iscsiTargetUuids
                    }
                  }
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']) {
      const iscsiTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByIscsiTargetUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'IscsiLun',
                  fields: ['uuid'],
                  condition: {
                    iscsiTargetUuid: {
                      [ZOp.in]: iscsiTargetUuids
                    }
                  }
                }
              }
            }
          },
          {
            wwid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'SharedBlock',
                  fields: ['diskUuid']
                }
              }
            }
          },
          {
            uuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'ScsiLunVmInstanceRef',
                  fields: ['scsiLunUuid']
                }
              }
            }
          }
        ]
      })
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    const hostUuid = _conditions.find(item => item.key === 'scsiLunHostRef.hostUuid')?.value
    const healthStateValues = _extraConditionMap.healthState?.values ?? []
    if (hostUuid && healthStateValues.length === 1) {
      const zql = ZQL.stringify({
        tableName: 'ScsiLun',
        fields: ['uuid'],
        condition: zqlCondition
      })
      const lunResp = await this.zqlService.call(zql)
      const lunUuids = _.uniq(lunResp?.results?.[0]?.inventories?.map(item => item.uuid) ?? [])
      if (!lunUuids.length) {
        return { uuid: { [ZOp.in]: [] } }
      }
      const mpathResp = await this.getHostMultipathTopologyAction.call({
        hostUuid,
        lunUuids
      })
      const filteredLunUuids = mpathResp?.results?.reduce((prev, curr) => {
        const hasRunning = curr.devices?.some(item => item.state === 'running')
        if (healthStateValues[0] === 'running' ? hasRunning : !hasRunning) {
          prev.push(curr.lunUuid)
        }
        return prev
      }, [])
      return { uuid: { [ZOp.in]: _.uniq(filteredLunUuids ?? []) } }
    }

    return zqlCondition
  }

  async getScsiLunCandidatesForAttachingVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const vmInstanceUuid = conditionsMap['vmInstanceUuid']

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetScsiLunCandidatesForAttachingVm',
            output: 'inventories.uuid',
            condition: {
              vmInstanceUuid
            }
          }
        }
      }
    }
  }

  async getScsiLunCandidatesForAttachingZSVInstanceByHost(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const hostUuid = conditionsMap['hostUuid']

    //
    // ZQLQuery zql="query scsiLun where state='Enabled' and uuid in (query scsiLunHostRef.scsiLunUuid where hostUuid='0fff1f1e32ed40cfafcffa13427f5461') and wwid not in (query sharedBlock.diskUuid)"

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'scsiLunHostRef',
            fields: 'scsiLunUuid',
            condition: {
              hostUuid
            }
          }
        }
        // [ZOp.notIn]: {
        //   [ZOp.query]: {
        //     tableName: 'scsiLunVmInstanceRef',
        //     fields: 'scsiLunUuid'
        //   }
        // }
      },
      state: {
        [ZOp.eq]: 'Enabled'
      },
      wwid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'sharedBlock',
            fields: 'diskUuid'
          }
        }
      }
    }
  }

  async getScsiLunCandidatesForAttachingZSVInstanceByCluster(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const clusterUuid = conditionsMap['clusterUuid']

    //
    // ZQLQuery zql="query scsiLun where state='Enabled' and uuid in (query scsiLunHostRef.scsiLunUuid where hostUuid in (query host.uuid where cluster.uuid='d35120cff7ad49029dbb3a28275444e7')) and wwid not in (query sharedBlock.diskUuid)"

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'scsiLunHostRef',
            fields: 'scsiLunUuid',
            condition: {
              hostUuid: {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'host',
                    fields: 'uuid',
                    condition: {
                      'cluster.uuid': clusterUuid
                    }
                  }
                }
              }
            }
          }
        }
        // [ZOp.notIn]: {
        //   [ZOp.query]: {
        //     tableName: 'scsiLunVmInstanceRef',
        //     fields: 'scsiLunUuid'
        //   }
        // }
      },
      state: {
        [ZOp.eq]: 'Enabled'
      },
      wwid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'sharedBlock',
            fields: 'diskUuid'
          }
        }
      }
    }
  }

  // 获取创建SharedBlock主存储所需共享块设备候选清单。【有问题，弃用！！！】
  async getSharedBlockCandidate(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const clusterUuid = conditionsMap['clusterUuid']

    let zqlCondition = null
    if (clusterUuid) {
      zqlCondition = {
        wwid: {
          [ZOp.in]: {
            [ZOp.getapi]: {
              action: ZQLAction.GET_API,
              api: 'GetSharedBlockCandidate',
              output: 'results.wwid',
              condition: {
                clusterUuid
              }
            }
          }
        }
      }
    }
    return zqlCondition
  }

  async getLunDeviceMultiPathList(params: IQueryAction): Promise<LunDeviceMultiPathList> {
    const { hostUuid, lunUuids, state } = conditionsToObject(params.conditions) as {
      hostUuid: string
      lunUuids: string[]
      state?: string[]
    }

    const resp = await this.getHostMultipathTopologyAction.call({
      lunUuids,
      hostUuid
    })

    let list: LunDeviceMultiPathDetail[] = []

    _.forEach(resp.results, (item: { devices: LunDeviceMultiPathDetail[]; lunUuid: string }) => {
      list = list.concat(
        item.devices.map((it, index) => ({
          ...it,
          uuid: item.lunUuid + it.disk + index
        }))
      )
    })

    if (state?.length === 1) {
      if (state[0] === 'running') {
        list = list.filter(item => item.state === 'running')
      } else {
        list = list.filter(item => item.state !== 'running')
      }
    }

    if (params.limit) {
      const start = params.start ?? 0
      const end = start + params.limit
      list = list.slice(start, end)
    }

    return {
      list,
      total: list.length
    }
  }

  async queryHealthState(uuid: string, hostUuid: string) {
    return await this.healthStateLoader.load({ uuid, hostUuid })
  }

  private _queryHealthState = async (values: Array<{ uuid: string; hostUuid: string }>) => {
    const groupedByHost = _.groupBy(values, 'hostUuid')
    const resultMap = new Map<string, string>()
    await Promise.all(
      Object.entries(groupedByHost).map(async ([hostUuid, items]: [string, { uuid: string }[]]) => {
        const lunUuids = _.uniq(items.map(item => item.uuid))
        const resp = await this.getHostMultipathTopologyAction.call({
          hostUuid,
          lunUuids
        })
        resp?.results?.forEach(result => {
          if (result.devices?.length) {
            const key = `${result.lunUuid}-${hostUuid}`
            const state = result.devices.some(item => item.state === 'running')
              ? 'running'
              : 'failed'
            resultMap.set(key, state)
          }
        })
      })
    )
    return values.map(item => resultMap.get(`${item.uuid}-${item.hostUuid}`) || null)
  }
}
