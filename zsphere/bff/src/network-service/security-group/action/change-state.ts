import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeSecurityGroupStateAction } from '@/api/zstack/ChangeSecurityGroupStateAction'
import { ActionService } from '@/base/action-service'
import { SecurityGroupStateEvent } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ChangeSecurityGroupStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => SecurityGroupStateEvent)
  stateEvent: SecurityGroupStateEvent
}

@InputType()
class ChangeSecurityGroupStateInput {
  @Field(() => [ChangeSecurityGroupStatePayload])
  payload: ChangeSecurityGroupStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSecurityGroupStateService extends ActionService {
  @Inject()
  action: ChangeSecurityGroupStateAction

  @Mutation(() => ActionResult)
  changeSecurityGroupState(@Args('input') input: ChangeSecurityGroupStateInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ChangeSecurityGroupStatePayload, taskId: string) => {
      const { inventory } = await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid,
        fields: 'state,lastOpDate',
        inventory
      }
    }

    this.actionHelper(input, 'SecurityGroup', actionFn)
    return { actionId }
  }
}
