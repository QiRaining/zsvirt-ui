import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce, isEqual as _isEqual } from 'lodash'

import { conditionsToObject, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAccountResourceRefAction } from '@/api/zstack/QueryAccountResourceRefAction'
import { QueryStackTemplateAction } from '@/api/zstack/QueryStackTemplateAction'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { ZQLAction, ZOp, QueryConditionTranslator } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  QueryStackTemplateResp,
  QueryStackTemplateArgs,
  StackTemplateQueryType
} from './stack-template.model'

@Injectable()
export class StackTemplateService {
  private templateTypeDataLoader

  constructor() {
    this.templateTypeDataLoader = new DataLoader(this._checkIsSystemTemplate)
  }

  @Inject()
  zqlService: ZQLService
  @Inject()
  queryStackTemplateAction: QueryStackTemplateAction
  @Inject()
  queryAccountResourceRefAction: QueryAccountResourceRefAction

  /**
   * QueryStackTemplate type=zstack state?=true
   * QueryStackTemplate type=zstack state?=true,false
   * true，false 不支持in
   * @param conditions
   */
  handleStateFilterMultiple(conditions: ICondition[] = []) {
    const findState = conditions.find(it => it.key === 'state' && it?.op === ZOp.in)
    if (findState) {
      const findValues = findState?.values
      if (findValues?.length) {
        let condition: ICondition
        const isEnable = _isEqual(findValues, ['true'])
        if (isEnable) {
          condition = {
            key: 'state',
            op: ZOp.eq,
            value: 'true'
          }
        }

        const isDisable = _isEqual(findValues, ['false'])
        if (isDisable) {
          condition = {
            key: 'state',
            op: ZOp.eq,
            value: 'false'
          }
        }

        const isAll = _isEqual(findValues?.sort(), ['true', 'false'].sort())
        if (isAll) {
        }

        const _conditions = conditions.filter(it => it?.key !== 'state')

        if (condition) {
          _conditions.push(condition)
        }

        return _conditions
      }
    }
    return conditions
  }

  async query(params: QueryStackTemplateArgs): Promise<QueryStackTemplateResp> {
    const { type = StackTemplateQueryType.Normal, conditions = [] } = params

    const $conditions = this.handleStateFilterMultiple(conditions)

    let _shareTypeConditions
    const [_conditions, conditionMap] = extractAndRemoveExtraCondition($conditions, ['shareType'])
    if (conditionMap.shareType) {
      _shareTypeConditions = QueryConditionTranslator.generateShareTypeZqlConditon(
        conditionMap?.shareType?.values,
        'StackTemplateVO'
      )
    }

    let _extrazqlConditions
    switch (type) {
      case StackTemplateQueryType.Custom:
        _extrazqlConditions = {
          __systemTag__: {
            [ZOp.ne]: 'systemtemplate'
          }
        }
        break

      case StackTemplateQueryType.Example:
        _extrazqlConditions = {
          __systemTag__: {
            [ZOp.eq]: 'systemtemplate'
          }
        }
        break

      case StackTemplateQueryType.Self:
        _extrazqlConditions = this.getAccountRefStackTemplate(params, ZOp.in)
        break

      case StackTemplateQueryType.Share:
        _extrazqlConditions = this.getSharedStackTemplate(params)
        break

      default:
        break
    }
    if (_shareTypeConditions) {
      _extrazqlConditions = {
        [ZOp.and]: [
          {
            ..._extrazqlConditions
          },
          {
            ..._shareTypeConditions
          }
        ]
      }
    }
    const zqlCondition = QueryConditionTranslator.translate(_conditions, _extrazqlConditions)
    return await this.getStackTemplate(params, zqlCondition)
  }

  async getStackTemplate(param, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'StackTemplate',
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
    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data
    return { list, total }
  }

  getSharedStackTemplate(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const accountUuid = extraConditionsMap['accountUuid']
    if (accountUuid) {
      return {
        [ZOp.and]: [
          {
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'SharedResource',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: 'StackTemplateVO',
                    [ZOp.or]: {
                      receiverAccountUuid: accountUuid,
                      toPublic: true
                    }
                  }
                }
              }
            }
          },
          {
            __systemTag__: {
              [ZOp.ne]: 'systemtemplate'
            }
          }
        ]
      }
    }
  }

  getAccountRefStackTemplate(params, operation = ZOp.in) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const accountUuid = extraConditionsMap['accountUuid']
    if (accountUuid) {
      return {
        [ZOp.and]: [
          {
            uuid: {
              [operation]: {
                [ZOp.query]: {
                  tableName: 'AccountResourceRef',
                  fields: ['resourceUuid'],
                  condition: {
                    resourceType: {
                      [ZOp.eq]: 'StackTemplateVO'
                    },
                    accountUuid
                  }
                }
              }
            }
          },
          {
            __systemTag__: {
              [ZOp.ne]: 'systemtemplate'
            }
          }
        ]
      }
    }
  }

  checkIsSystemTemplate(uuid) {
    return this.templateTypeDataLoader.load(uuid)
  }

  _checkIsSystemTemplate = async (uuids: string[]) => {
    const genZql = uuid => {
      return {
        action: ZQLAction.COUNT,
        tableName: 'SystemTag',
        condition: {
          resourceUuid: uuid,
          resourceType: 'StackTemplateVO',
          tag: 'systemtemplate'
        },
        namedAs: uuid
      }
    }

    const zql = ZQL.multStringify(uuids.map(uuid => genZql(uuid)))
    const { results = [] } = await this.zqlService.call(zql)
    const map = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'total', 0)
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      const count = map[uuid]
      if (count) {
        return true
      } else {
        return false
      }
    })
  }
}
