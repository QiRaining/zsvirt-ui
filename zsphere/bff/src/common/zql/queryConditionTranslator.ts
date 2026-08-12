import { flatten as _flatten, isEmpty as _isEmpty } from 'lodash'

import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { Op } from '../../api/zstack/base/query-base'
import type { Condition } from '../model/action-query.model'
import ZOp from './zop'
import type { ZqlObject } from './zqlBuilder'

/**
 * 合并两个zqlObject
 * @param zqlObj1
 * @param zqlObj2
 */
export function mergeZqlObject(
  zqlObj1: Partial<ZqlObject>,
  zqlObj2: Partial<ZqlObject>
): ZqlObject {
  const { fields = [], condition = {}, ...rest } = zqlObj1 ?? {}
  const { fields: _fields = [], condition: _condition = {}, ..._rest } = zqlObj2 ?? {}

  const obj = Object.keys({ ...rest, ..._rest }).reduce((p, key) => {
    p[key] = rest[key] || _rest[key]

    return p
  }, {})

  const fs = [...new Set([...fields, ..._fields])]

  const obj1 = Object.keys({ ...condition, ..._condition }).reduce((p, key) => {
    const c1 = condition[key]
    const c2 = _condition[key]
    if (c1 && c2) {
      if (key === ZOp[ZOp.and] || key === ZOp[ZOp.or]) {
        p[key] = [...c1, ...c2]
      } else {
        const and = condition[ZOp[ZOp.and]] || _condition[ZOp[ZOp.and]]
        if (and) {
          and.push({
            [key]: c1
          })
          and.push({
            [key]: c2
          })
        } else {
          p[ZOp[ZOp.and]] = [
            {
              [key]: c1
            },
            {
              [key]: c2
            }
          ]
        }
      }
    } else {
      p[key] = c1 || c2
    }

    return p
  }, {})

  return {
    ...obj,
    condition: obj1,
    fields: fs
  } as any
}
/**
 * 数组到map , [v1,v2] => {key1:v1,...}
 * @param arr 需要map的数组
 * @param key map的属性id ,默认uuid
 */
export function arrayToMap<T extends {}>(arr: T[], key = 'uuid'): { [key: string]: T } {
  const res: { [key: string]: T } = {}
  arr.reduce((p, c) => {
    const _key = c[key]
    p[_key] = c
    return p
  }, res)

  return res
}

export class QueryConditionTranslator {
  public static translate(
    conditions?: Condition[],
    extrazqlConditions?: ZqlObject['condition']
  ): ZqlObject['condition'] {
    const _zqlCondition = conditions.reduce((pv, cv) => {
      const { key, value, op = Op.eq, values } = cv
      const val = value ?? values ?? null
      ;(pv[ZOp.and] || (pv[ZOp.and] = [])).push({
        [key]: {
          [op]: val
        }
      })
      return pv
    }, {})

    // 空数组，空对象
    return _isEmpty(extrazqlConditions)
      ? _zqlCondition
      : {
          [ZOp.and]: (_zqlCondition[ZOp.and] || (_zqlCondition[ZOp.and] = [])).concat(
            extrazqlConditions
          )
        }
  }

  public static generateOwnerZqlConditon(
    ownerName: string,
    resourceType?: string | string[]
  ): ZqlObject['condition'] {
    const _resourceType = resourceType
      ? {
          [ZOp.in]: _flatten([resourceType])
        }
      : {
          [ZOp.not]: null
        }
    return {
      [ZOp.or]: [
        {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'AccountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: _resourceType,
                  accountUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'account',
                        fields: ['uuid'],
                        condition: {
                          name: {
                            [ZOp.like]: ownerName
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
      ]
    }
  }
  // need doc
  public static generateShareTypeZqlConditon(shareTypes: string[], resourceType: string) {
    const _zqlCondition = {}
    shareTypes.reduce((zqlCondition, shareType: ShareType) => {
      if (!zqlCondition[ZOp.or]) {
        zqlCondition[ZOp.or] = []
      }
      if (shareType === ShareType.None) {
        zqlCondition[ZOp.or].push({
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType,
                  type: {
                    [ZOp.in]: ['SharePublic', 'Share']
                  }
                }
              }
            }
          }
        })
      }
      if (shareType === ShareType.Group) {
        zqlCondition[ZOp.or].push({
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType,
                  type: {
                    [ZOp.notIn]: ['SharePublic', 'Own']
                  }
                }
              }
            }
          }
        })
      }
      if (shareType === ShareType.Public) {
        zqlCondition[ZOp.or].push({
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: ['resourceUuid'],
                condition: {
                  resourceType,
                  type: 'SharePublic'
                }
              }
            }
          }
        })
      }
      return zqlCondition
    }, _zqlCondition)
    return _zqlCondition
  }

  /**
   * 把 queryparams condition合并到 zqlObject
   * @param queryAction query params
   * @param zqlObj init zqlObject
   * @param delUndefinedKey 删除空key
   */
  public static mergeQueryAction(
    queryAction: any,
    zqlObj: ZqlObject,
    delUndefinedKey = false
  ): ZqlObject {
    const zqlObjectKeys = [
      'action',
      'fnName',
      'tableName',
      'fields',
      'sumBy',
      'condition',
      'returnWith',
      'restrictBy',
      'groupBy',
      'orderBy',
      'orderDirection',
      'limit',
      'offset',
      'namedAs'
    ]
    const mapKeys = {
      replyWithCount: 'returnWith',
      sortBy: 'orderBy',
      sortDirection: 'orderDirection',
      start: 'offset'
    }

    // parse ownerName
    // const res = mergeOwnerNameToSearchCondition(queryAction_)
    // const { zqlObj: _ownerZqlObj } = res
    // let { queryAction } = res

    queryAction = Object.keys(queryAction).reduce((obj, key) => {
      if (Object.keys(mapKeys).includes(key)) {
        if (key === 'replyWithCount') {
          obj[mapKeys[key]] = { total: queryAction[key] }
        } else {
          obj[mapKeys[key]] = queryAction[key]
        }
      } else {
        obj[key] = queryAction[key]
      }
      return obj
    }, {})

    const { conditions = [], ...restQueryAction } = queryAction
    const { condition = {}, tableName, ...restZqlObj } = zqlObj

    const _queryAction = Object.keys(restQueryAction)
      .filter(k => zqlObjectKeys.includes(k))
      .reduce((obj, key) => {
        obj[key] = restQueryAction[key]
        return obj
      }, {}) as any
    const _zqlObj = Object.keys(restZqlObj)
      .filter(k => zqlObjectKeys.includes(k))
      .reduce((obj, key) => {
        obj[key] = restZqlObj[key]
        return obj
      }, {}) as ZqlObject

    let mergedZqlObj: ZqlObject = {
      ..._queryAction,
      ..._zqlObj,
      tableName
    }

    // 合并 queryaction key，相同的key 放入[key]= [] 的数组中

    // const combinedCond = {
    //   [ZOp.and]: [
    //     {
    //       key: value,
    //       key: { [Op.xx]: value },
    //       key3: value,
    //       key3: { [Op.xx]: value }
    //     }
    //   ],
    //   key1: value,
    //   key2: {
    //     [Op.xx]: value
    //   }
    // }

    const keyInConds = (key, conds) => {
      return !!conds.find(cond => key in cond) && conds
    }

    const combinedCond = {}
    // 从 queryAction To ZqlContition
    for (let i = 0; i < conditions.length; i++) {
      const { key, op = Op.eq, value, values } = conditions[i]
      const c = combinedCond[key]
      const cInCombinedCond = key in combinedCond

      // 只存在and的情况
      const conds = keyInConds(key, combinedCond[ZOp.and] ?? [])
      // value 可能是null或者空string
      const v = value !== undefined ? value : values

      // 相同的key已经在and 数组
      if (conds) {
        if (op !== Op.eq) {
          conds.push({
            [key]: {
              [op]: v
            }
          })
        } else {
          conds.push({
            [key]: v
          })
        }
        continue
      }

      if (!cInCombinedCond) {
        if (op !== Op.eq) {
          combinedCond[key] = {
            [op]: v
          }
        } else {
          combinedCond[key] = v
        }
        continue
      }

      if (cInCombinedCond) {
        const andConds = combinedCond[ZOp.and] ?? []

        andConds.push({
          [key]: c
        })

        delete combinedCond[key]

        if (op !== Op.eq) {
          andConds.push({
            [key]: {
              [op]: v
            }
          })
        } else {
          andConds.push({
            [key]: v
          })
        }

        combinedCond[ZOp.and] = andConds
      }
    }

    // 从 ZqlObject Condition To ZqlContition
    Object.keys(condition).forEach(key => {
      const c = condition[key]
      // key 在{}
      const cInCondition = key in combinedCond
      // key 在ZOp.and []
      const conds = keyInConds(key, combinedCond[ZOp.and] ?? [])

      if (key === ZOp[ZOp.and]) {
        if (!combinedCond[ZOp.and]) {
          combinedCond[ZOp.and] = []
        }
        combinedCond[ZOp.and] = [...combinedCond[ZOp.and], ...c]
      } else if (cInCondition) {
        if (!combinedCond[ZOp.and]) {
          combinedCond[ZOp.and] = []
        }
        combinedCond[ZOp.and].push({
          [key]: c
        })
        combinedCond[ZOp.and].push({
          [key]: combinedCond[key]
        })
        delete combinedCond[key]
      } else if (conds) {
        conds.push({
          [key]: c
        })
      } else {
        combinedCond[key] = c
      }
    })

    // rest condition
    // mergedCondition = { ...mergedCondition, ...condition }

    mergedZqlObj = { ...mergedZqlObj, condition: combinedCond }

    if (delUndefinedKey) {
      mergedZqlObj = JSON.parse(JSON.stringify(mergedZqlObj))
    }

    return mergedZqlObj
  }
}

/**
 * 数组到map数组 , [v1,v2,v3...] => {key1:[v1,v2],key2:[v3]..}
 * @param arr 需要map的数组
 * @param key map的属性id ,默认uuid
 */
export function arrayToArrayMap<T extends {}>(arr: T[], key = 'uuid'): { [key: string]: T[] } {
  const res: { [key: string]: T[] } = {}
  arr.reduce((p, c) => {
    const _key = c[key]
    if (!p[_key]) {
      p[_key] = []
    }
    p[_key].push(c)
    return p
  }, res)
  return res
}
