import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RestoreNkpAction } from '@/api/zstack/RestoreNkpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RestoreNkpPayload {
  @Field(() => String)
  contentBase64!: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
class RestoreNkpInput {
  @Field(() => RestoreNkpPayload)
  payload!: RestoreNkpPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class RestoreNkpService extends ActionService {
  @Inject() restoreNkpAction!: RestoreNkpAction

  @Mutation(() => ActionResult)
  restoreNkp(@Args('input') input: RestoreNkpInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'KmsProvider', async (payload: RestoreNkpPayload, taskId: string) => {
      const result = await this.restoreNkpAction.call(payload, {
        actionId,
        taskId
      })
      return { id: result?.inventory?.uuid }
    })
    return { actionId }
  }
}
