import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { groupBy, uniq } from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql'
import { PlainObject, ZqlObject } from '@/common/zql/zqlBuilder'

import { ResourceAttributeConstraint, ResourceAttributeValue } from './resource-attribute.model'

const supportedResourceTypes = [
  'VmInstanceVO',
  'HostVO',
  'PrimaryStorageVO',
  'L2NetworkVO',
  'L3NetworkVO',
  'BaremetalInstanceVO'
]

@Injectable()
export class ResourceAttributeService {
  @Inject() private zqlService: ZQLService
  @Inject() private getResourceNamesAction: GetResourceNamesAction

  private resourceNameDataloader: DataLoader<string, string>
  private resourceCountDataloader: DataLoader<ResourceAttributeConstraint, number, string>
  private resourceAttributeValuesDataloader: DataLoader<string, ResourceAttributeValue[]>

  constructor() {
    this.resourceNameDataloader = new DataLoader(this._getResourceName)
    this.resourceCountDataloader = new DataLoader(this._getResourceCount, {
      cacheKeyFn: item => item.id
    })
    this.resourceAttributeValuesDataloader = new DataLoader(this._getResourceAttributeValues)
  }

  async queryConstraintList(param: QueryAction) {
    const { conditions = [] } = param
    const zqlCondition = QueryConditionTranslator.translate(conditions)
    const zqlObject: ZqlObject = {
      tableName: 'ResourceAttributeConstraint',
      condition: zqlCondition,
      limit: param.limit,
      offset: param.start,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const total = resp?.results?.[0]?.total ?? 0
    return { list, total }
  }

  async queryKeyList(param: QueryAction) {
    const [conditions, extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, [
      'resourceType'
    ])
    const extraConditions = []
    if (extraConditionMap.resourceType?.values?.length) {
      const typeValues = extraConditionMap.resourceType.values
      const typeCondition = {
        'types.resourceType': {
          [ZOp.in]: typeValues
        }
      }
      if (typeValues.includes('ResourceAttributeKeyVO')) {
        extraConditions.push(typeCondition)
      } else {
        extraConditions.push({
          ...typeCondition,
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'ResourceAttributeKeyResourceType',
                fields: ['keyUuid'],
                condition: { resourceType: 'ResourceAttributeKeyVO' }
              }
            }
          }
        })
      }
    }
    const zqlCondition = QueryConditionTranslator.translate(conditions, extraConditions)
    const zqlObject: ZqlObject = {
      tableName: 'ResourceAttributeKey',
      condition: zqlCondition,
      limit: param.limit,
      offset: param.start,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const total = resp?.results?.[0]?.total ?? 0
    return { list, total }
  }

  async queryValueList(param: QueryAction) {
    const [conditions, extraConditionMap] = extractAndRemoveExtraCondition(param.conditions, [
      'resourceName'
    ])
    const extraConditions: Array<PlainObject> = [
      {
        resourceUuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'TemplatedVmInstance',
              fields: ['uuid']
            }
          }
        }
      },
      {
        resourceUuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'TemplatedVmInstanceCache',
              fields: ['cacheVmInstanceUuid']
            }
          }
        }
      }
    ]
    if (extraConditionMap.resourceName?.value) {
      const searchZqlObject = {
        action: ZQLAction.SEARCH,
        keyword: extraConditionMap.resourceName.value
      }
      const searchZql = ZQL.stringify(searchZqlObject)
      const searchResp = await this.zqlService.call(searchZql)
      const searchUuids =
        searchResp?.results?.[0]?.inventories
          ?.filter(item => supportedResourceTypes.includes(item.resourceType))
          .map(item => item.uuid) ?? []
      extraConditions.push({
        resourceUuid: {
          [ZOp.in]: searchUuids
        }
      })
    }
    const zqlCondition = QueryConditionTranslator.translate(conditions, extraConditions)
    const zqlObject: ZqlObject = {
      tableName: 'ResourceAttributeValue',
      condition: zqlCondition,
      limit: param.limit,
      offset: param.start,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      returnWith: {
        total: true
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const total = resp?.results?.[0]?.total ?? 0
    return { list, total }
  }

  getResourceName(uuid: string) {
    return this.resourceNameDataloader.load(uuid)
  }

  private _getResourceName = async (uuids: string[]) => {
    const result = await this.getResourceNamesAction.call({
      uuids: uniq(uuids)
    })
    const resourceNames = result?.inventories ?? []
    const resourceNameMap = new Map(resourceNames.map(item => [item.uuid, item.resourceName]))
    return uuids.map(uuid => resourceNameMap.get(uuid))
  }

  getResourceCount(constraint: ResourceAttributeConstraint) {
    return this.resourceCountDataloader.load(constraint)
  }

  private _getResourceCount = async (constraintList: ResourceAttributeConstraint[]) => {
    const keyUuids = uniq(constraintList.map(item => item.keyUuid))
    const zql = ZQL.stringify({
      tableName: 'ResourceAttributeValue',
      action: ZQLAction.COUNT,
      groupBy: ['keyUuid', 'value'],
      condition: {
        keyUuid: { [ZOp.in]: keyUuids },
        [ZOp.and]: [
          {
            resourceUuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'TemplatedVmInstance',
                  fields: ['uuid']
                }
              }
            }
          },
          {
            resourceUuid: {
              [ZOp.notIn]: {
                [ZOp.query]: {
                  tableName: 'TemplatedVmInstanceCache',
                  fields: ['cacheVmInstanceUuid']
                }
              }
            }
          }
        ]
      }
    })
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventoryCounts ?? []
    const map = new Map<string, number>(
      list.map(([{ keyUuid, value }, count]) => [`${keyUuid}-${value}`, count])
    )
    return constraintList.map(item => map.get(`${item.keyUuid}-${item.parameter}`) ?? 0)
  }

  getResourceAttributeValues(uuid: string) {
    return this.resourceAttributeValuesDataloader.load(uuid)
  }

  _getResourceAttributeValues = async (uuids: string[]) => {
    const zqlObject: ZqlObject = {
      tableName: 'ResourceAttributeValue',
      condition: {
        resourceUuid: {
          [ZOp.in]: uniq(uuids)
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)
    const list = resp?.results?.[0]?.inventories ?? []
    const map = groupBy(list, 'resourceUuid')
    return uuids.map(uuid => map[uuid])
  }
}
