import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { StartSnmpAgentAction, StartSnmpAgentResult } from '@/api/zstack/StartSnmpAgentAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StartSnmpAgentPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class StartSnmpAgentInput {
  @Field(() => StartSnmpAgentPayload)
  payload: StartSnmpAgentPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class StartSnmpAgentService extends ActionService {
  @Inject() startSnmpAgentAction: StartSnmpAgentAction

  @Mutation(() => ActionResult)
  startSnmpAgent(@Args('input') input: StartSnmpAgentInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpAgent',
      async (payload: StartSnmpAgentPayload, taskId: string) => {
        try {
          const result: StartSnmpAgentResult = await this.startSnmpAgentAction.call(payload, {
            actionId,
            taskId
          })
          return {
            id: result?.inventory?.uuid,
            inventory: result?.inventory
          }
        } catch (e) {
          console.log(e)
        }
      }
    )
    return { actionId }
  }
}
