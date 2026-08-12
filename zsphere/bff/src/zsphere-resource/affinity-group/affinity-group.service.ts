import { Injectable, Inject } from '@nestjs/common'
import DataLoader = require('dataloader')
import { get as _get, compact as _compact } from 'lodash'

import { AddVmToAffinityGroupAction } from '@/api/zstack/AddVmToAffinityGroupAction'
import {
  Condition,
  Op,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetResourceAccountAction,
  GetResourceAccountActionParam as IGetResourceAccountActionParam
} from '@/api/zstack/GetResourceAccountAction'
import { QueryAffinityGroupAction } from '@/api/zstack/QueryAffinityGroupAction'
import { RemoveVmFromAffinityGroupAction } from '@/api/zstack/RemoveVmFromAffinityGroupAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { AffinityGroupQueryType } from './affinity-group.model'

@Injectable()
export class AffinityGroupService extends ActionService {
  @Inject() queryAffinityGroupAction: QueryAffinityGroupAction
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() addVmToAffinityGroupAction: AddVmToAffinityGroupAction
  @Inject() removeVmFromAffinityGroupAction: RemoveVmFromAffinityGroupAction
  @Inject() zqlService: ZQLService

  private ownerDataloader

  private resourceAccountMap: any = {}

  constructor() {
    super()
    this.ownerDataloader = new DataLoader(this._getOwner)
  }

  async queryList(params: IQueryAction) {
    const { type = AffinityGroupQueryType.Normal, extraConditions = [] } = params
    const baseConditions = [
      {
        key: 'appliance',
        value: 'CUSTOMER',
        op: Op.eq
      }
    ]
    // const _zqlCondition = QueryConditionTranslator.translate(
    //   params.conditions.concat(baseConditions)
    // )
    let _extraZqlConditions
    let _resultResp = null

    const conditionsMap = conditionsToObject(extraConditions) as any

    switch (type) {
      case AffinityGroupQueryType.Normal:
        break
      case AffinityGroupQueryType.GetCandidateAffinityGroupForVmAttaching:
        _extraZqlConditions = {
          uuid: {
            [ZOp.in]: `getapi(api='GetCandidateAffinityGroupForAttachingVm',output='inventories.uuid',vmUuid='${conditionsMap?.vmUuid}')`
          }
        }
        break
      default:
        break
    }

    const zqlCondition = this.buildZqlCondition(
      params.conditions.concat(baseConditions),
      _extraZqlConditions
    )

    _resultResp = await this.getAffinityGroupList(params, zqlCondition)

    return _resultResp
  }

  async getAffinityGroupList(param: IQueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'AffinityGroup',
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
    const affinityGroups = results?.[0]?.inventories || []
    const total = results?.[0]?.total || 0

    return {
      list: affinityGroups,
      total: total
    }
  }

  buildZqlCondition(conditions: Condition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions = [], _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName'
    ])

    const specicalCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'AffinityGroupVO')
      )
    }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  getOwner(uuid) {
    return this.ownerDataloader.load(uuid)
  }

  _getOwner = async (uuids: string[]) => {
    const params: IGetResourceAccountActionParam = {
      resourceUuids: uuids
    }
    const { inventories } = await this.getResourceAccountAction.call(params)
    return uuids.map(uuid => {
      const owner = _get(inventories, uuid)
      if (owner) {
        return owner
      } else {
        return null
      }
    })
  }
}
