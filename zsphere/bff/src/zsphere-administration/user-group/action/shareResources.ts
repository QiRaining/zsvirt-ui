import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddLogConfigurationAction } from '@/api/zstack/AddLogConfigurationAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ShareResourcesPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String)
  configuration: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class ShareResourcesInput {
  @Field(() => ShareResourcesPayload)
  payload: ShareResourcesPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ShareResourcesService extends ActionService {
  @Inject() action: AddLogConfigurationAction

  @Mutation(() => ActionResult)
  shareResources(@Args('input') input: ShareResourcesInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ShareResourcesPayload, taskId: string) => {
      const { inventory } = await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: JSON.parse(inventory.labelValue).uuid,
        inventory
      }
    }

    this.actionHelper(input, 'UserGroup', actionFn)
    return { actionId }
  }
}
