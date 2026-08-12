import { Inject, Injectable } from '@nestjs/common'
import { assign as _assign, isEmpty as _isEmpty, reduce } from 'lodash'

import { extractAndRemoveExtraCondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetVolumeSnapshotSizeAction } from '@/api/zstack/GetVolumeSnapshotSizeAction'
import { QueryVolumeSnapshotTreeAction } from '@/api/zstack/QueryVolumeSnapshotTreeAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { SnapshotQueryType } from '../resource-snapshot.model'

@Injectable()
export class ZSVResourceSnapshotQueryService {
  @Inject() private readonly zqlService: ZQLService
  @Inject()
  private readonly getVolumeSnapshotSizeAction: GetVolumeSnapshotSizeAction
  @Inject() private readonly queryTreeAction: QueryVolumeSnapshotTreeAction

  private readonly SNAPSHOT_TYPE = {
    GROUP: 'Group',
    MEMORY: 'Memory'
  }

  async queryListGroupByVolume(param: IQueryAction) {
    const queryConditions = this.buildVmConditions(param)
    return this.getGroupedSnapshotByVolume({
      ...param,
      conditions: [...param.conditions, ...queryConditions]
    })
  }

  private buildVmConditions(param: IQueryAction): ICondition[] {
    const { type = SnapshotQueryType.VM } = param
    switch (type) {
      case SnapshotQueryType.VM:
        return [
          { key: 'volumeType', op: Op.eq, value: 'Root' },
          { key: 'volume.vmInstance.hypervisorType', op: Op.eq, value: 'KVM' }
        ]
      default:
        return []
    }
  }

  private async getGroupedSnapshotByVolume(param: IQueryAction) {
    const [mainQuery, countQuery] = await Promise.all([
      this.buildMainZqlObject(param),
      this.buildCountZqlObject(param.conditions)
    ])

    const zql = ZQL.multStringify([mainQuery, countQuery])
    const { results } = await this.zqlService.call(zql)

    return this.processGroupedResults(results, param.sortBy)
  }

  private async buildMainZqlObject(param: IQueryAction): Promise<ZqlObject> {
    const zqlCondition = await this.buildZqlCondition(param.conditions)
    const baseConfig = {
      tableName: 'volumeSnapshot',
      condition: zqlCondition,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }

    return param.sortBy === 'count'
      ? {
          ...baseConfig,
          action: ZQLAction.COUNT,
          groupBy: 'volumeUuid',
          orderBy: 'groupCount'
        }
      : {
          ...baseConfig,
          action: ZQLAction.SUM,
          sumBy: 'volumeUuid',
          fields: ['size'],
          orderBy: 'size'
        }
  }

  private async buildCountZqlObject(conditions: ICondition[]): Promise<ZqlObject> {
    const zqlCondition = await this.buildZqlCondition(conditions)
    return {
      action: ZQLAction.COUNT,
      tableName: 'volume',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'volumeSnapshot',
              fields: ['volumeUuid'],
              condition: zqlCondition
            }
          }
        }
      }
    }
  }

  private processGroupedResults(results: any[], sortBy?: string) {
    const [resultData = {}, { total = 0 } = {}] = results || []
    const inventoryKey = sortBy === 'count' ? 'inventoryCounts' : 'inventories'
    const inventories = resultData[inventoryKey] ?? []

    // 统一映射逻辑，通过动态属性名消除重复代码
    const mapInventoryItem = (item: any) => {
      const [volumeUuid, value] = sortBy === 'count' ? [item[0]?.volumeUuid, item[1]] : item
      return { volumeUuid, [sortBy === 'count' ? 'count' : 'size']: value }
    }

    return {
      list: inventories.map(mapInventoryItem),
      total
    }
  }

  private handleExtraConditions(baseCondition: any, extraMap: Record<string, any>) {
    let condition = baseCondition
    condition = this.handleSnapshotTypeCondition(condition, extraMap.snapshotType?.values)
    condition = this.handleMemoryCondition(condition, extraMap.memoryInFormation?.values)
    return condition
  }

  private handleSnapshotTypeCondition(condition: any, types?: string[]) {
    if (!types || types.length !== 1) {
      return condition
    }

    return types[0] === this.SNAPSHOT_TYPE.GROUP
      ? this.mergeGroupCondition(condition)
      : this.mergeNonGroupCondition(condition)
  }

  private mergeGroupCondition(condition: any) {
    const base = condition[ZOp.and] ?? []
    return {
      [ZOp.and]: [...base, { 'group.uuid': { [ZOp.not]: null } }]
    }
  }

  private mergeNonGroupCondition(condition: any) {
    return {
      [ZOp.and]: condition[ZOp.and],
      uuid: {
        [ZOp.notIn]: {
          [ZOp.query]: {
            tableName: 'volumeSnapshot',
            fields: ['uuid'],
            condition: { 'group.uuid': { [ZOp.not]: null } }
          }
        }
      }
    }
  }

  private handleMemoryCondition(condition: any, values?: string[]) {
    if (!values || values.length !== 1) {
      return condition
    }

    const isMemory = values[0] === 'true'
    const operator = isMemory ? ZOp.in : ZOp.notIn
    const memoryCondition = {
      volumeType: { [ZOp.eq]: this.SNAPSHOT_TYPE.MEMORY }
    }

    return {
      [ZOp.and]: [
        ...condition[ZOp.and],
        { 'group.uuid': { [ZOp.not]: null } },
        {
          'group.uuid': {
            [operator]: {
              [ZOp.query]: {
                tableName: 'volumeSnapshotGroupRef',
                fields: ['volumeSnapshotGroupUuid'],
                condition: memoryCondition
              }
            }
          }
        }
      ]
    }
  }
  private async getZqlCondition(params: IQueryAction) {
    const { conditions } = params
    const [, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, ['memoryInFormation'])
    let zqlCondition = await this.buildZqlCondition(conditions)
    if (_extraConditionMap['memoryInFormation']) {
      const types = _extraConditionMap['memoryInFormation'].values
      if (types.length == 2) {
        zqlCondition = {
          [ZOp.and]: [
            ...zqlCondition['and'],
            {
              'group.uuid': {
                [ZOp.not]: null
              }
            }
          ]
        }
        return zqlCondition
      }
      if (types?.length && types?.[0] === 'true') {
        zqlCondition = {
          [ZOp.and]: [
            ...zqlCondition['and'],
            {
              'group.uuid': {
                [ZOp.not]: null
              }
            },
            {
              'group.uuid': {
                [ZOp.in]: {
                  [ZOp.query]: {
                    tableName: 'volumeSnapshotGroupRef',
                    fields: ['volumeSnapshotGroupUuid'],
                    condition: {
                      volumeType: {
                        [ZOp.eq]: 'Memory'
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      } else {
        zqlCondition = {
          [ZOp.and]: [
            ...zqlCondition['and'],
            {
              'group.uuid': {
                [ZOp.not]: null
              }
            },
            {
              'group.uuid': {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'volumeSnapshotGroupRef',
                    fields: ['volumeSnapshotGroupUuid'],
                    condition: {
                      volumeType: {
                        [ZOp.eq]: 'Memory'
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
    return zqlCondition
  }
  async queryList(param: IQueryAction) {
    const zqlCondition = await this.getZqlCondition(param)
    const zqlObject = this.buildListZqlObject(param, zqlCondition)

    const { results } = await this.zqlService.call(ZQL.stringify(zqlObject))
    return this.processListResults(results)
  }

  private buildListZqlObject(param: IQueryAction, condition: any): ZqlObject {
    return {
      tableName: 'volumeSnapshot',
      condition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: { total: true }
    }
  }

  private processListResults(results: any[]) {
    return {
      list: results?.[0]?.inventories ?? [],
      total: results?.[0]?.total ?? 0
    }
  }

  async getActualSize(uuid: string) {
    const result = await this.getVolumeSnapshotSizeAction.call({ uuid })
    return result.actualSize
  }

  async queryGroupList(param: IQueryAction) {
    const zqlCondition = await this.buildZqlCondition(param.conditions)
    const zqlObject = this.buildGroupListZqlObject(param, zqlCondition)

    const { results } = await this.zqlService.call(ZQL.stringify(zqlObject))
    return this.processListResults(results)
  }

  private buildGroupListZqlObject(param: IQueryAction, condition: any): ZqlObject {
    return {
      tableName: 'volumeSnapshotGroup',
      condition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: { total: true }
    }
  }

  private async buildZqlCondition(conditions: ICondition[]) {
    const [remainingConditions, extraMap] = extractAndRemoveExtraCondition(conditions, [
      '__search__'
    ])
    const specialConditions = this.buildSearchCondition(extraMap.__search__?.value)
    return QueryConditionTranslator.translate(remainingConditions, specialConditions)
  }

  private buildSearchCondition(searchValue?: string) {
    if (!searchValue) {
      return []
    }

    return [
      {
        [ZOp.or]: [
          { 'volume.vmInstance.name': { [ZOp.like]: `%${searchValue}%` } },
          { 'volume.vmInstance.uuid': searchValue }
        ]
      }
    ]
  }

  async getSnapshotDeleteNeedSize(params) {
    const getNodeByUuid = (treeData: any, nodeKey: string) => {
      function treeFind(tree, func) {
        for (const data of tree) {
          if (func(data)) {
            return data
          }
          if (data.children) {
            const res = treeFind(data.children, func)
            if (res) {
              return res
            }
          }
        }
        return null
      }
      const subTree = treeFind(treeData, (e: any) => {
        if (e.inventory.uuid === nodeKey) {
          return e
        }
      })
      return subTree
    }

    const tree2list = (tree: any) => {
      const list = []
      const queue = [...tree]
      while (queue.length) {
        const node = queue.shift()
        const children = node.children
        if (children) {
          queue.push(...children)
        }
        list.push(node)
      }
      return list
    }

    const { inventories } = await this.queryTreeAction.call({
      conditions: [
        {
          key: ' volumeUuid',
          op: ZOp.eq,
          value: params.volumeUuid
        }
      ]
    })

    const snapShotTree = inventories[0].tree
    const sizeList = tree2list([getNodeByUuid([snapShotTree], params.snapShotUuid)]).map(
      t => t.inventory.size
    )
    const totalSize = reduce(
      sizeList,
      function (sum, n) {
        return sum + n
      },
      0
    )

    return {
      deleteNeedSize: totalSize
    }
  }
}
