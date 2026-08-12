import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import {
  conditionsToObject,
  extractAndRemoveExtraCondition,
  Condition as ICondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { SshKeyPairQueryType } from '../ssh-key-pair.model'

@Injectable()
export class SshKeyPairQueryService {
  @Inject() zqlService: ZQLService

  private vmNumDataLoader

  constructor() {
    this.vmNumDataLoader = new DataLoader(this._getVmNum)
  }

  async queryList(params: IQueryAction) {
    const { type = SshKeyPairQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case SshKeyPairQueryType.NORMAL:
        break
      case SshKeyPairQueryType.GetAttachableSshKeyPairForVmInstance:
        _extrazqlConditions = await this.getAttachableSshKeyPairForVmInstance(
          params.extraConditions
        )
        break
      case SshKeyPairQueryType.GetDetachableSshKeyPairForVmInstance:
        _extrazqlConditions = await this.getDetachableSshKeyPairForVmInstance(
          params.extraConditions
        )
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getSshKeyPairList(params, zqlCondition)

    return _resultResp
  }

  async getSshKeyPairList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const action = param?.count ? ZQLAction.COUNT : ZQLAction.QUERY
    const zqlObject = {
      action,
      tableName: 'SshKeyPair',
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
    const sshKeyPairs = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: sshKeyPairs,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      '__tagUuid__',
      'vmInstance.name',
      '__VmInstanceUuid__',
      'ownerName'
    ])

    const specicalCondition = []

    // 根据vmInstance的名称搜索
    if (_extraConditionMap['vmInstance.name']) {
      const vmInstanceName: string = _extraConditionMap['vmInstance.name']?.value

      const vmZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SshKeyPairRef',
              fields: ['sshKeyPairUuid'],
              condition: {
                resourceUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'VmInstance',
                      fields: ['uuid'],
                      condition: {
                        name: {
                          [ZOp.like]: vmInstanceName
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      specicalCondition.push(vmZqlCondition)
    }

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName']?.value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'SshKeyPairVO')
      )
    }

    if (_extraConditionMap['__tagUuid__']) {
      const tagQueryOp = _extraConditionMap['__tagUuid__'].op
      if (['in', 'notIn'].indexOf(tagQueryOp) !== -1) {
        const tagFilterUuids = _extraConditionMap['__tagUuid__'].values
        if (tagFilterUuids?.filter(t => t === '__null__')?.length === 0) {
          specicalCondition.push({
            __tagUuid__: {
              [ZOp[tagQueryOp]]: {
                [ZOp.query]: {
                  tableName: 'UserTag',
                  fields: ['tagPatternUuid'],
                  condition: {
                    tagPatternUuid: {
                      [ZOp.in]: tagFilterUuids
                    }
                  }
                }
              }
            }
          })
        } else {
          //Null和正常标签
          specicalCondition.push({
            [ZOp.or]: [
              {
                __tagUuid__: {
                  [ZOp.notIn]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid']
                    }
                  }
                }
              },
              {
                __tagUuid__: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'UserTag',
                      fields: ['tagPatternUuid'],
                      condition: {
                        tagPatternUuid: {
                          [ZOp.in]: tagFilterUuids.filter(t => t !== '__null__')
                        }
                      }
                    }
                  }
                }
              }
            ]
          })
        }
      } else {
        //非in notIn condition还原
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
          }
        })
      }
    }

    // 根据VmInstanceUuid的搜索, 可用于搜索挂载到vm上的sshkeypair
    if (_extraConditionMap['__VmInstanceUuid__']) {
      const vmInstanceUuids: string[] = _.compact(
        _.flatten([
          _extraConditionMap['__VmInstanceUuid__']?.value ||
            _extraConditionMap['__VmInstanceUuid__']?.values
        ])
      )

      const vmZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SshKeyPairRef',
              fields: ['sshKeyPairUuid'],
              condition: {
                resourceUuid: {
                  [ZOp.in]: _.uniq(vmInstanceUuids)
                }
              }
            }
          }
        }
      }

      specicalCondition.push(vmZqlCondition)
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _.compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getAttachableSshKeyPairForVmInstance(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'SshKeyPairRef',
            fields: ['sshKeyPairUuid'],
            condition: {
              resourceUuid: params?.vmInstanceUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  async getDetachableSshKeyPairForVmInstance(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _.pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'SshKeyPairRef',
            fields: ['sshKeyPairUuid'],
            condition: {
              resourceUuid: params?.vmInstanceUuid
            }
          }
        }
      }
    }

    return zqlCondition
  }

  getVmNum(uuid) {
    return this.vmNumDataLoader.load(uuid)
  }

  _getVmNum = async (uuids: string[]) => {
    const vmZql = {
      tableName: 'SshKeyPairRef',
      action: ZQLAction.COUNT,
      groupBy: 'sshKeyPairUuid',
      condition: {
        sshKeyPairUuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(vmZql)
    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = _.get(results, ['0', 'inventoryCounts'], [])

    const pairMap = _.reduce(
      inventoryCounts,
      (obj, it) => {
        const [pairInfo, total = 0] = it

        obj[pairInfo?.sshKeyPairUuid] = total

        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(pairMap, uuid, 0))
  }
}
