import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeResourceOwnerAction } from '@/api/zstack/ChangeResourceOwnerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeResourceOwnerPayload {
  @Field(() => String)
  accountUuid: string

  @Field(() => String)
  resourceUuid: string
}

@InputType()
export class ChangeResourceOwnerInput {
  @Field(() => [ChangeResourceOwnerPayload])
  payload: ChangeResourceOwnerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeResourceOwnerService extends ActionService {
  @Inject() changeAction: ChangeResourceOwnerAction

  @Mutation(() => ActionResult)
  changeResourceOwner(@Args('input') input: ChangeResourceOwnerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Owner',
      async (payload: ChangeResourceOwnerPayload, taskId: string) => {
        const { resourceUuid } = payload
        await this.changeAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: resourceUuid
        }
      }
    )
    return { actionId }
  }
}
