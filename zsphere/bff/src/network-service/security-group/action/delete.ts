import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSecurityGroupAction } from '@/api/zstack/DeleteSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSecurityGroupPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteSecurityGroupInput {
  @Field(() => [DeleteSecurityGroupPayload])
  payload: DeleteSecurityGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSecurityGroupService extends ActionService {
  @Inject()
  action: DeleteSecurityGroupAction

  @Mutation(() => ActionResult)
  deleteSecurityGroup(@Args('input') input: DeleteSecurityGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteSecurityGroupPayload, taskId: string) => {
      await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid
      }
    }

    this.actionHelper(input, 'SecurityGroup', actionFn)
    return { actionId }
  }
}
