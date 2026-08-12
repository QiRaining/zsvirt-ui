import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { UpdateQuotaAction } from '@/api/zstack/UpdateQuotaAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateAccountQuotaPayload {
  @Field(() => String)
  identityUuid: string

  @Field(() => String)
  name: string

  @Field(() => Float)
  value: number
}

@InputType()
class UpdateAccountQuotaInput {
  @Field(() => [UpdateAccountQuotaPayload])
  payload: UpdateAccountQuotaPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAccountQuotaService extends ActionService {
  @Inject() updateQuotaAction: UpdateQuotaAction

  @Mutation(() => ActionResult)
  updateAccountQuota(@Args('input') input: UpdateAccountQuotaInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'AccountVO',
      async (payload: UpdateAccountQuotaPayload, taskId: string) => {
        const { identityUuid, name, value } = payload

        await this.updateQuotaAction.call({ identityUuid, name, value }, { actionId, taskId })
        return {
          id: identityUuid
        }
      }
    )
    return { actionId }
  }
}
