import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { StopSnmpAgentAction, StopSnmpAgentResult } from '@/api/zstack/StopSnmpAgentAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StopSnmpAgentPayload {
  @Field(() => String, { nullable: true })
  uuid: string
}

@InputType()
class StopSnmpAgentInput {
  @Field(() => StopSnmpAgentPayload)
  payload: StopSnmpAgentPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class StopSnmpAgentService extends ActionService {
  @Inject() stopSnmpAgentAction: StopSnmpAgentAction

  @Mutation(() => ActionResult)
  stopSnmpAgent(@Args('input') input: StopSnmpAgentInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'SnmpAgent', async (payload: StopSnmpAgentPayload, taskId: string) => {
      try {
        const result: StopSnmpAgentResult = await this.stopSnmpAgentAction.call(payload, {
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
    })
    return { actionId }
  }
}
