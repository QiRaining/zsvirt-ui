import { remove } from 'lodash'

import { Condition } from '@/common/model/action-query.model'
import { ZOp } from '@/common/zql'

export interface IExtractResourceAttributeConditionParam {
  resourceType: string
  conditions: Condition[]
}

export function extractResourceAttributeCondition({
  resourceType,
  conditions
}: IExtractResourceAttributeConditionParam) {
  const attributeConditions = remove(conditions, item => item.key === '__attribute__')
  if (!attributeConditions.length) {
    return null
  }
  return {
    [ZOp.and]: attributeConditions.map(cond => {
      if (cond.values?.length) {
        return {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ResourceAttributeValue',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: {
                    [ZOp.eq]: resourceType
                  },
                  keyUuid: {
                    [ZOp.eq]: cond.value
                  },
                  value: {
                    [ZOp.in]: cond.values
                  }
                }
              }
            }
          }
        }
      }
      return {
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ResourceAttributeValue',
              fields: ['resourceUuid'],
              condition: {
                resourceType: {
                  [ZOp.eq]: resourceType
                },
                keyUuid: {
                  [ZOp.eq]: cond.value
                }
              }
            }
          }
        }
      }
    })
  }
}
