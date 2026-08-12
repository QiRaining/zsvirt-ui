import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import {
  AddBlockPrimaryStorageAction,
  AddBlockPrimaryStorageActionParam
} from '@/api/zstack/AddBlockPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateBlockPrimaryStoragePayload {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String)
  metadata: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  vendorName: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => String, { nullable: true })
  encryptGatewayIp: string

  @Field(() => Int, { nullable: true })
  encryptGatewayPort: number

  @Field(() => String, { nullable: true })
  encryptGatewayUsername: string

  @Field(() => String, { nullable: true })
  encryptGatewayPassword: string

  @Field(() => [String], {
    nullable: true
  })
  systemTags: [string]
}

@InputType()
class CreateBlockPrimaryStorageInput {
  @Field(() => CreateBlockPrimaryStoragePayload)
  payload: CreateBlockPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBlockPrimaryStorageService extends ActionService {
  @Inject()
  addBlockPrimaryStorageAction: AddBlockPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  @Mutation(() => ActionResult)
  createBlockPrimaryStorage(@Args('input') input: CreateBlockPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateBlockPrimaryStoragePayload, taskId: string) => {
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

  _create = async (params: CreateBlockPrimaryStoragePayload, actionInfo: ActionInfo) => {
    const { clusterUuid, ...param } = params
    const resp = await this.addBlockPrimaryStorageAction.call(
      param as AddBlockPrimaryStorageActionParam,
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
