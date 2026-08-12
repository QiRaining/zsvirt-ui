import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { chunk as _chunk, compact as _compact, flatten as _flatten, get as _get } from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryBaremetalInstanceAction } from '@/api/zstack/QueryBaremetalInstanceAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { genUuid } from '@/utils'
import { extractResourceAttributeCondition } from '@/zsphere-monitoring-om/resource-attribute/util'
import {
  BaremetalDisk,
  BaremetalInstance
} from '@/zsphere-resource/baremetal/baremetal-instance/baremetal-instance.model'

@Injectable()
export class BaremetalInstanceQueryService {
  @Inject()
  queryBaremetalInstanceAction: QueryBaremetalInstanceAction
  @Inject()
  zqlService: ZQLService

  private hardwareInfoDataLoader

  constructor() {
    this.hardwareInfoDataLoader = new DataLoader(this._getHardwareInfo)
  }

  async query(params: IQueryAction) {
    const zqlCondition = await this.buildZqlCondition(params.conditions)

    const zqlObject = {
      tableName: 'BaremetalInstance',
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
    const baremetalInstances = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: baremetalInstances,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[]) {
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'owner',
      '__tagUuid__'
    ])

    const specicalCondition = []
    if (_extraConditionMap['owner']) {
      const ownerName = _extraConditionMap['owner'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'BaremetalInstanceVO')
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
        specicalCondition.push({
          __tagUuid__: {
            [ZOp[tagQueryOp]]: _extraConditionMap['__tagUuid__'].value
          }
        })
      }
    }

    const resourceAttributeZqlCondition = extractResourceAttributeCondition({
      resourceType: 'BaremetalInstanceVO',
      conditions: _conditions
    })
    if (resourceAttributeZqlCondition) {
      specicalCondition.push(resourceAttributeZqlCondition)
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition)
    )

    return zqlCondition
  }

  getHardwareInfo(baremetalInstance: BaremetalInstance) {
    return this.hardwareInfoDataLoader.load(baremetalInstance)
  }

  _getHardwareInfo = async (baremetalInstances: BaremetalInstance[]) => {
    const zqlObject = {
      tableName: 'baremetalhardwareInfo',
      fields: ['content', 'chassisUuid'],
      condition: {
        chassisUuid: {
          [ZOp.in]: baremetalInstances.map(item => item.chassisUuid)
        },
        type: 'basic'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const infoMap = {}
    resp.results[0].inventories.forEach(item => {
      const content = JSON.parse(item.content)
      infoMap[item.chassisUuid] = {
        cpuNum: content.cpu_core,
        memory: parseInt(content.memory.slice(0, -3)) * 1024,
        cpuModel: content.cpu_model.replace(/\s+/g, ' ')
      }
    })
    return baremetalInstances.map(baremetalInstance =>
      _get(infoMap, [baremetalInstance.chassisUuid], null)
    )
  }

  async queryBaremetalNicList(params: IQueryAction) {
    params = { replyWithCount: true, ...params }
    const { limit = 20, start = 0 } = params
    const { inventories } = await this.queryBaremetalInstanceAction.call(params)
    const list = _flatten(inventories.map(item => item.bmNics))
    return {
      list: _chunk(list, limit)[start],
      total: list.length
    }
  }

  async queryBaremetalDiskList(params: IQueryAction) {
    const { limit = 20, start = 0 } = params
    const zqlObject = QueryConditionTranslator.mergeQueryAction(params, {
      tableName: 'baremetalhardwareInfo',
      condition: {
        type: 'disk'
      }
    })

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list: BaremetalDisk[] = _flatten(
      resp.results[0].inventories.map(item => JSON.parse(item.content))
    )
    list.forEach(item => {
      item.uuid = genUuid()
    })
    return {
      list: _chunk(list, limit)[start],
      total: list.length
    }
  }

  async getBaremetalInstanceConfigSummary(uuid: string, chassisUuid: string) {
    const zqlObjects = [
      {
        tableName: 'baremetalhardwareInfo',
        fields: ['content', 'type'],
        condition: {
          chassisUuid,
          type: 'disk'
        }
      },
      {
        tableName: 'BaremetalInstance',
        condition: {
          uuid
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const resp = await this.zqlService.call(zql)
    const result = {
      nic: resp?.results?.[1]?.inventories?.[0]?.bmNics?.length ?? 0
    }
    resp.results[0].inventories.forEach(item => {
      result[item.type] = JSON.parse(item.content).length
    })
    return result
  }
}
