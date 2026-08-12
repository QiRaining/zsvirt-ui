import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { UpdateResourceConfigsAction } from '@/api/zstack/UpdateResourceConfigsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class IResourceConfigs {
  @Field(() => String)
  value: string

  @Field(() => String)
  name: string

  @Field(() => String)
  category: string
}

@InputType()
export class UpdateResourceConfigsPayload {
  @Field(() => [IResourceConfigs])
  resourceConfigs: IResourceConfigs[]

  @Field(() => String)
  resourceUuid: string
}

@InputType()
class UpdateResourceConfigsInput {
  @Field(() => [UpdateResourceConfigsPayload])
  payload: UpdateResourceConfigsPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateResourceConfigsService extends ActionService {
  @Inject() updateResourceConfigsAction: UpdateResourceConfigsAction

  @Mutation(() => ActionResult)
  updateResourceConfigs(@Args('input') input: UpdateResourceConfigsInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceConfigInPage',
      async (payload: UpdateResourceConfigsPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: UpdateResourceConfigsPayload, taskId: string, actionId) {
    const { resourceConfigs, resourceUuid } = payload

    await this.updateResourceConfigsAction.call(
      { resourceConfigs, resourceUuid },
      { actionId, taskId }
    )

    return {
      id: payload.resourceUuid
    }
  }
}
