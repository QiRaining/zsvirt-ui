import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddCephPrimaryStorageAction,
  AddCephPrimaryStorageActionParam
} from '@/api/zstack/AddCephPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateCephPrimaryStoragePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [String])
  monUrls: string[]

  @Field(() => String, { nullable: true })
  rootVolumePoolName: string

  @Field(() => String, { nullable: true })
  dataVolumePoolName: string

  @Field(() => String, { nullable: true })
  imageCachePoolName: string

  @Field(() => [String], {
    nullable: true,
    description: '存储网络 | 关闭 Cephx'
  })
  systemTags: [string]
}

@InputType()
class CreateCephPrimaryStorageInput {
  @Field(() => CreateCephPrimaryStoragePayload)
  payload: CreateCephPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateCephPrimaryStorageService extends ActionService {
  @Inject()
  addCephPrimaryStorageAction: AddCephPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  @Mutation(() => ActionResult)
  createCephPrimaryStorage(@Args('input') input: CreateCephPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateCephPrimaryStoragePayload, taskId: string) => {
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

  _create = async (params: CreateCephPrimaryStoragePayload, actionInfo: ActionInfo) => {
    const { clusterUuid, ...param } = params
    const resp = await this.addCephPrimaryStorageAction.call(
      param as AddCephPrimaryStorageActionParam,
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
