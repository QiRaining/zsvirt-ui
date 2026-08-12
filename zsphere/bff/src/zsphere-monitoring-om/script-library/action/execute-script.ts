import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float } from '@nestjs/graphql'

import { ExecuteGuestVmScriptAction } from '@/api/zstack/ExecuteGuestVmScriptAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExecuteScriptPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  vmInstanceUuids: string[]

  @Field(() => Float, { nullable: true })
  scriptTimeout?: number
}

@InputType()
class ExecuteScriptInput {
  @Field(() => ExecuteScriptPayload)
  payload: ExecuteScriptPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExecuteScriptService extends ActionService {
  @Inject() executeGuestVmScriptAction: ExecuteGuestVmScriptAction

  @Mutation(() => ActionResult)
  executeScript(@Args('input') input: ExecuteScriptInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Script', async (payload: ExecuteScriptPayload, taskId: string) => {
      const { inventory } = await this.executeGuestVmScriptAction.call(
        { ...payload },
        { actionId, taskId }
      )
      return {
        id: payload?.uuid,
        fields: `name,description,scriptContent,renderParams,scriptTimeout,lastOpDate`,
        inventory
      }
    })
    return { actionId }
  }
}
