import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddNfsPrimaryStorageAction,
  AddNfsPrimaryStorageActionParam
} from '@/api/zstack/AddNfsPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateNFSPrimaryStoragePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => [String], { nullable: true, description: '存储网络 | 挂载参数' })
  systemTags?: [string]
}

@InputType()
export class CreateNFSPrimaryStorageInput {
  @Field(() => CreateNFSPrimaryStoragePayload)
  payload: CreateNFSPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateNFSPrimaryStorageService extends ActionService {
  @Inject()
  addNfsPrimaryStorageAction: AddNfsPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  @Mutation(() => ActionResult)
  createNfsPrimaryStorage(@Args('input') input: CreateNFSPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateNFSPrimaryStoragePayload, taskId: string) => {
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

  _create = async (params: CreateNFSPrimaryStoragePayload, actionInfo: ActionInfo) => {
    const { clusterUuid, ...param } = params
    const resp = await this.addNfsPrimaryStorageAction.call(
      param as AddNfsPrimaryStorageActionParam,
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
