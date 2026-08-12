import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'

import { NVMeLunType } from './nvme-lun.model'

@Injectable()
export class NVMeLunQueryService {
  @Inject() zqlService: ZQLService

  private nvmeServerDataLoader

  constructor() {
    this.nvmeServerDataLoader = new DataLoader(this._queryNVMeServer)
  }

  async queryList(params: IQueryAction) {
    const { type = NVMeLunType.Normal } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case NVMeLunType.Normal:
        break

      case NVMeLunType.TransportNotPcie:
        _extrazqlConditions = {
          'nvmeLunHostRef.transport': {
            [ZOp.ne]: 'PCIE'
          }
        }
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getNVMeLunList(params, zqlCondition)

    return _resultResp
  }

  async getNVMeLunList(param: IQueryAction, zqlCondition) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'NvmeLun',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const NVMeLuns = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: NVMeLuns,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions) {
    const specicalCondition = []

    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      '__GetUsedLunByNvmeTargetUuids__', // 通过NvmeTarget，获取被使用过的NvmeLun
      '__GetUnUsedLunByNvmeTargetUuids__', // 通过NvmeTarget，获取未被使用过的NvmeLun
      '__GetUsedLunByNvmeServerUuids__', // 通过NvmeServer，获取被使用过的Nvme-LUN
      '__GetUnUsedLunByNvmeServerUuids__' // 通过NvmeServer，获取未被使用过的Nvme-LUN
    ])

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'NvmeLunVO')
      )
    }

    if (_extraConditionMap['__GetUsedLunByNvmeServerUuids__']) {
      const nvmeServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByNvmeServerUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByNvmeServerUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
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
                  tableName: 'NvmeLun',
                  fields: ['uuid'],
                  condition: {
                    'nvmeTarget.nvmeServerUuid': {
                      [ZOp.in]: nvmeServerUuids
                    }
                  }
                }
              }
            }
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByNvmeServerUuids__']) {
      const nvmeServerUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByNvmeServerUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByNvmeServerUuids__']?.values
        ])
      )

      specicalCondition.push({
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'NvmeLun',
                  fields: ['uuid'],
                  condition: {
                    'nvmeTarget.nvmeServerUuid': {
                      [ZOp.in]: nvmeServerUuids
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
          }
        ]
      })
    }

    if (_extraConditionMap['__GetUsedLunByNvmeTargetUuids__']) {
      const nvmeTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUsedLunByNvmeTargetUuids__']?.value ||
            _extraConditionMap['__GetUsedLunByNvmeTargetUuids__']?.values
        ])
      )

      specicalCondition.push({
        wwid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SharedBlock',
              fields: ['diskUuid']
            }
          }
        },
        nvmeTargetUuid: {
          [ZOp.in]: nvmeTargetUuids
        }
      })
    }

    if (_extraConditionMap['__GetUnUsedLunByNvmeTargetUuids__']) {
      const nvmeTargetUuids = _.compact(
        _.flatten([
          _extraConditionMap['__GetUnUsedLunByNvmeTargetUuids__']?.value ||
            _extraConditionMap['__GetUnUsedLunByNvmeTargetUuids__']?.values
        ])
      )

      specicalCondition.push({
        nvmeTargetUuid: {
          [ZOp.in]: nvmeTargetUuids
        },
        wwid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'SharedBlock',
              fields: ['diskUuid']
            }
          }
        }
      })
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  queryNVMeServer(nvmeTargetUuid: string) {
    return this.nvmeServerDataLoader.load(nvmeTargetUuid)
  }

  _queryNVMeServer = async (nvmeTargetUuids: string[]) => {
    const nvmeTargetUuidsChunk = _.chunk(_.uniq(nvmeTargetUuids), 50)

    let resultList = []

    await Promise.all(
      _.map(nvmeTargetUuidsChunk, async nvmeTargetUuids => {
        const multZql = ZQL.multStringify(
          _.map(nvmeTargetUuids, nvmeTargetUuid => {
            return {
              tableName: 'NvmeServer',
              fields: ['uuid', 'name'],
              condition: {
                uuid: {
                  [ZOp.eq]: {
                    [ZOp.query]: {
                      tableName: 'NvmeTarget',
                      fields: ['nvmeServerUuid'],
                      condition: {
                        uuid: nvmeTargetUuid
                      }
                    }
                  }
                }
              },
              namedAs: nvmeTargetUuid
            }
          })
        )

        const { results } = await this.zqlService.call(multZql)
        resultList = resultList.concat(results)
      })
    )
    const nvmeServerMap = _.reduce(
      resultList,
      (obj, it) => {
        obj[it.name] = _.get(it, ['inventories', '0'], {})
        return obj
      },
      {}
    )

    return nvmeTargetUuids.map(uuid => {
      const server = nvmeServerMap[uuid]
      if (!server?.uuid) {
        return null
      }
      return server
    })
  }
}
