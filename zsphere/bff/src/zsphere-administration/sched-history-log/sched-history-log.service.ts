import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'

import { extractAndRemoveExtraCondition, Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class SchedHistoryLogService extends ActionService {
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() zqlService: ZQLService
  private slbDataloader: any
  private slbMap: any = {}

  constructor() {
    super()
    this.slbDataloader = new DataLoader(this._query)
  }

  _query = async (uuids: string[]) => {
    const vmUuids = uuids.map(uuid => this.slbMap[uuid].vmUuid)

    const zql = ZQL.multStringify([
      {
        action: ZQLAction.QUERY,
        tableName: 'SlbVmInstance',
        fields: ['slbGroupUuid', 'uuid'],
        condition: {
          uuid: {
            [ZOp.in]: vmUuids
          }
        }
      },
      {
        action: ZQLAction.QUERY,
        tableName: 'SlbLoadBalancer',
        fields: ['uuid', 'slbGroupUuid'],
        condition: {
          slbGroupUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'SlbVmInstance',
                fields: ['slbGroupUuid'],
                conditions: {
                  uuid: {
                    [ZOp.in]: vmUuids
                  }
                }
              }
            }
          }
        }
      }
    ])

    const { results } = await this.zqlService.call(zql)

    return uuids.map(uuid => {
      const vmUuid = this.slbMap[uuid]?.vmUuid
      const slbVmInstance = results?.[0]?.inventories
      const slbLoadBalancer = results?.[1]?.inventories
      const slbGroupUuid = slbVmInstance?.find(e => e.uuid === vmUuid)?.slbGroupUuid
      const slbUuid = slbLoadBalancer?.find(e => e.slbGroupUuid === slbGroupUuid)?.uuid
      return slbUuid || null
    })
  }

  async querySlbUuid(uuid, vmUuid) {
    this.slbMap[uuid] = {
      uuid,
      vmUuid
    }

    return this.slbDataloader.load(uuid)
  }

  async query(params: QueryAction) {
    const { conditions, limit, start, sortBy, sortDirection } = params

    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(conditions, [
      'owner',
      'vm',
      'destHost',
      'preHost',
      'taskResult'
    ])

    if (conditionMap.owner) {
      const zql = ZQL.stringify({
        action: ZQLAction.QUERY,
        tableName: 'IAM2VirtualID',
        fields: ['uuid'],
        condition: {
          name: {
            [ZOp.like]: conditionMap.owner.value
          }
        }
      })
      const [
        { inventories: accounts },
        {
          results: [{ inventories: iam2Accounts }]
        }
      ] = await Promise.all([
        this.queryAccountAction.call({
          conditions: [
            {
              key: 'name',
              value: conditionMap.owner.value,
              op: Op.like
            }
          ],
          fields: ['uuid']
        }),
        this.zqlService.call(zql) // 走zql防止没权限报错
      ])
      const uuids = accounts.concat(iam2Accounts).map(cv => cv.uuid)
      _conditions.push({
        key: 'accountUuid',
        values: uuids,
        op: Op.in
      })
    }

    if (conditionMap.vm) {
      const { inventories: vms } = await this.queryVmInstanceAction.call({
        conditions: [
          {
            key: 'name',
            value: conditionMap.vm.value,
            op: Op.like
          }
        ]
      })
      _conditions.push({
        key: 'vmInstanceUuid',
        values: vms.map(cv => cv.uuid),
        op: Op.in
      })
    }

    if (conditionMap.destHost) {
      const { inventories: hosts } = await this.queryHostAction.call({
        conditions: [
          {
            key: 'name',
            value: conditionMap.destHost.value,
            op: Op.like
          }
        ]
      })
      _conditions.push({
        key: 'destHostUuid',
        values: hosts.map(cv => cv.uuid),
        op: Op.in
      })
    }

    if (conditionMap.preHost) {
      const { inventories: hosts } = await this.queryHostAction.call({
        conditions: [
          {
            key: 'name',
            value: conditionMap.preHost.value,
            op: Op.like
          }
        ]
      })
      _conditions.push({
        key: 'lastHostUuid',
        values: hosts.map(cv => cv.uuid),
        op: Op.in
      })
    }

    if (conditionMap.taskResult) {
      const taskResultValue = conditionMap.taskResult.value
      const taskResultValueIsTrue = taskResultValue === true || taskResultValue === 'value'
      _conditions.push({
        key: 'success',
        value: taskResultValueIsTrue ? 'true' : 'false',
        op: Op.eq
      })
    }

    const zqlCondition = QueryConditionTranslator.translate(_conditions)

    const zqlObject: ZqlObject = {
      tableName: 'vmschedhistory',
      action: ZQLAction.QUERY,
      condition: zqlCondition,
      orderBy: sortBy || 'id',
      orderDirection: sortDirection || 'desc',
      limit,
      offset: start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)

    const { results } = await this.zqlService.call(zql)

    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data

    return {
      list,
      total
    }
  }
}
