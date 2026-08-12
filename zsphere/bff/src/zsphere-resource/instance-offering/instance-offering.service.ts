import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeInstanceOfferingAction } from '@/api/zstack/ChangeInstanceOfferingAction'
import { ChangeInstanceOfferingStateAction } from '@/api/zstack/ChangeInstanceOfferingStateAction'
import { CreateInstanceOfferingAction } from '@/api/zstack/CreateInstanceOfferingAction'
import { DeleteInstanceOfferingAction } from '@/api/zstack/DeleteInstanceOfferingAction'
import { QueryInstanceOfferingAction } from '@/api/zstack/QueryInstanceOfferingAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import {
  RevokeResourceSharingAction,
  RevokeResourceSharingResult
} from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction, ShareResourceResult } from '@/api/zstack/ShareResourceAction'
import { InstanceOfferingInventory } from '@/api/zstack/types'
import { UpdateInstanceOfferingAction } from '@/api/zstack/UpdateInstanceOfferingAction'
import { ValidateInstanceOfferingUserConfigAction } from '@/api/zstack/ValidateInstanceOfferingUserConfigAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction, QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'
import {
  AllocatorStrategyType,
  InstanceOfferingQueryResp,
  RevokeInstanceOfferingSharingFromPublicInput,
  ShareInstanceOfferingToPublicInput
} from '@/zsphere-resource/instance-offering/instance-offering.model'

@Injectable()
export class InstanceOfferingService extends ActionService {
  @Inject() queryInstanceOfferingAction: QueryInstanceOfferingAction
  @Inject() createInstanceOfferingAction: CreateInstanceOfferingAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject()
  changeInstanceOfferingStateAction: ChangeInstanceOfferingStateAction
  @Inject() changeInstanceOfferingAction: ChangeInstanceOfferingAction
  @Inject() deleteInstanceOfferingAction: DeleteInstanceOfferingAction

  @Inject() updateInstanceOfferingAction: UpdateInstanceOfferingAction
  @Inject() querySystemTagsAction: QuerySystemTagAction
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject() zqlService: ZQLService
  @Inject()
  validateInstanceOfferingUserConfigAction: ValidateInstanceOfferingUserConfigAction

  private instanceOfferingSystemTagDataloader
  private instanceOfferingToPublicDataloader

  constructor() {
    super()
    this.instanceOfferingSystemTagDataloader = new DataLoader(this._querySystemTags)
    this.instanceOfferingToPublicDataloader = new DataLoader(this._queryToPublic)
  }

  async query(params: IQueryAction): Promise<InstanceOfferingQueryResp> {
    const { type = 'NORMAL', conditions = [] } = params
    let finalZqlCondition: any = {}
    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(conditions, ['shareType'])
    if (conditionMap.shareType) {
      const { values = [] } = conditionMap.shareType
      finalZqlCondition = QueryConditionTranslator.generateShareTypeZqlConditon(
        values,
        'InstanceOfferingVO'
      )
    }
    switch (type) {
      case 'SHARED_RESOURCE':
        finalZqlCondition = await this.sharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'InstanceOfferingVO'
        )
        break
    }
    const zql = QueryConditionTranslator.mergeQueryAction(params, {
      tableName: 'instanceOffering',
      condition: finalZqlCondition
    })
    const { results } = await this.zqlService.call(ZQL.stringify(zql))
    return {
      list: results?.[0]?.inventories || [],
      total: results?.[0]?.total || 0
    }
  }

  async queryByUuid(uuid: string): Promise<InstanceOfferingInventory> {
    const params: QueryAction = {
      conditions: [{ key: 'uuid', value: uuid }]
    }

    const { inventories } = await this.queryInstanceOfferingAction.call(params)

    return inventories?.[0] ?? null
  }

  querySystemTags(uuid) {
    return this.instanceOfferingSystemTagDataloader.load(uuid)
  }

  _querySystemTags = async (uuids = []) => {
    const zqlObject = {
      tableName: 'SystemTag',
      fields: ['tag', 'resourceUuid'],
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        resourceType: 'InstanceOfferingVO'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const systemtags = results?.[0]?.inventories ?? []

    const systemtagsMap = _.reduce(
      systemtags,
      (obj, tagInfo) => {
        const { resourceUuid, tag } = tagInfo
        const [key, val] = _.split(tag, '::')
        _.set(obj, [resourceUuid, key], val)

        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(systemtagsMap, uuid, {}))
  }

  queryToPublic(uuid) {
    return this.instanceOfferingToPublicDataloader.load(uuid)
  }

  _queryToPublic = async (uuids = []) => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'SharedResource',
      groupBy: 'resourceUuid',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        resourceType: 'InstanceOfferingVO',
        toPublic: 'true'
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = results?.[0]?.inventoryCounts ?? []

    const toPublicMap = _.reduce(
      inventoryCounts,
      (obj, toPublicInfo) => {
        const [{ resourceUuid }, total] = toPublicInfo

        _.set(obj, resourceUuid, total > 0)

        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(toPublicMap, uuid, false))
  }

  async create(params): Promise<InstanceOfferingInventory> {
    const {
      name,
      cpuNum,
      memorySize,
      maxNum,
      strategyPattern,
      description,
      allocatorStrategy,
      reservedMemorySize,
      ...rest
    } = params
    const input: any = {
      name,
      cpuNum,
      memorySize,
      maxNum,
      strategyPattern,
      allocatorStrategy,
      description,
      systemTags: []
    }

    if (reservedMemorySize) {
      input.reservedMemorySize = reservedMemorySize
    }
    if (
      input.allocatorStrategy === AllocatorStrategyType.MaxInstancePerHostHostAllocatorStrategy &&
      input.maxNum !== undefined
    ) {
      input.systemTags.push(`maxInstancePerHost::${input.maxNum}`)
    }
    if (input.allocatorStrategy === AllocatorStrategyType.MinimumCPUUsageHostAllocatorStrategy) {
      input.systemTags.push(`minimumCPUUsageHostAllocatorStrategyMode::${input.strategyPattern}`)
    }
    if (input.allocatorStrategy === AllocatorStrategyType.MinimumMemoryUsageHostAllocatorStrategy) {
      input.systemTags.push(`minimumMemoryUsageHostAllocatorStrategyMode::${input.strategyPattern}`)
    }
    Object.keys(rest).forEach(key => {
      const val = rest[key]
      val && input.systemTags.push(`${key}::${val}`)
    })
    const allocatorStrategyMap = {
      [AllocatorStrategyType.LeastVmPreferredHostAllocatorStrategy]:
        'LeastVmPreferredHostAllocatorStrategy',
      [AllocatorStrategyType.MinimumCPUUsageHostAllocatorStrategy]:
        'MinimumCPUUsageHostAllocatorStrategy',
      [AllocatorStrategyType.MinimumMemoryUsageHostAllocatorStrategy]:
        'MinimumMemoryUsageHostAllocatorStrategy',
      [AllocatorStrategyType.MaxInstancePerHostHostAllocatorStrategy]:
        'MaxInstancePerHostHostAllocatorStrategy',
      [AllocatorStrategyType.LastHostPreferredAllocatorStrategy]:
        'LastHostPreferredAllocatorStrategy',
      [AllocatorStrategyType.DefaultHostAllocatorStrategy]: 'DefaultHostAllocatorStrategy'
    }
    input.allocatorStrategy = allocatorStrategyMap[allocatorStrategy]
    const { inventory } = await this.createInstanceOfferingAction.call(input)
    return inventory
  }

  async shareToPublic(params: ShareInstanceOfferingToPublicInput): Promise<ShareResourceResult> {
    return this.shareResourceAction.call({ ...params, toPublic: true })
  }

  async revokeFromPublic(
    params: RevokeInstanceOfferingSharingFromPublicInput
  ): Promise<RevokeResourceSharingResult> {
    return this.revokeResourceAction.call({
      ...params,
      toPublic: true,
      all: true
    })
  }

  async validateInstanceOfferingUserConfig(config: string) {
    try {
      await this.validateInstanceOfferingUserConfigAction.call({ config })
      //e.details ? e.details : e.body ? e.body : e
      return {
        valid: true
      }
    } catch (error) {
      const err = error.details ? error.details : error.body ? error.body : error
      return {
        valid: false,
        error: typeof err === 'string' ? err : JSON.stringify(err)
      }
    }
  }
}
