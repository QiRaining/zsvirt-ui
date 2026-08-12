import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddSharedBlockGroupPrimaryStorageAction,
  AddSharedBlockGroupPrimaryStorageActionParam
} from '@/api/zstack/AddSharedBlockGroupPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateSharedBlockGroupPrimaryStoragePayload {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String])
  diskUuids: string[]

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 厚置备 | 清理块设备'
  })
  systemTags: [string]

  @Field(() => String, {
    nullable: true,
    description: '资源UUID（保留UUID模式时传入vg name，重置UUID模式时不传）'
  })
  resourceUuid?: string
}

@InputType()
class CreateSharedBlockGroupPrimaryStorageInput {
  @Field(() => CreateSharedBlockGroupPrimaryStoragePayload)
  payload: CreateSharedBlockGroupPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSharedBlockGroupPrimaryStorageService extends ActionService {
  @Inject()
  addSharedBlockGroupPrimaryStorageAction: AddSharedBlockGroupPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  @Mutation(() => ActionResult)
  createSharedBlockGroupPrimaryStorage(
    @Args('input') input: CreateSharedBlockGroupPrimaryStorageInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateSharedBlockGroupPrimaryStoragePayload, taskId: string) => {
        const { inventory } = await this._create(payload, {
          actionId,
          taskId
        })

        return {
          id: inventory?.uuid,
          inventory
        }
      }
    )
    return { actionId }
  }

  _create = async (params: CreateSharedBlockGroupPrimaryStoragePayload, actionInfo: ActionInfo) => {
    const { clusterUuid, ...param } = params
    await new Promise(resolve => setTimeout(resolve, 1000)) // hook:
    const resp = await this.addSharedBlockGroupPrimaryStorageAction.call(
      param as AddSharedBlockGroupPrimaryStorageActionParam,
      actionInfo
    )
    const attachCluterParam = {
      primaryStorageUuid: resp?.inventory?.uuid,
      clusterUuid
    }
    if (clusterUuid && resp?.inventory?.uuid) {
      await this.attachPrimaryStorageToClusterAction.call(
        attachCluterParam as AttachPrimaryStorageToClusterActionParam,
        actionInfo
      )
    }

    return {
      id: resp?.inventory?.uuid,
      fields: 'name,description',
      inventory: resp?.inventory
    }
  }
}
