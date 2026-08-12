import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { UpdateConsoleProxyAgentAction } from '@/api/zstack/UpdateConsoleProxyAgentAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateConsoleProxyPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  consoleProxyOverriddenIp: string

  @Field(() => Int)
  consoleProxyPort: number
}

@InputType()
class UpdateConsoleProxyInput {
  @Field(() => [UpdateConsoleProxyPayload])
  payload: UpdateConsoleProxyPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateConsoleProxyService extends ActionService {
  @Inject() updateConsoleProxyAction: UpdateConsoleProxyAgentAction

  @Mutation(() => ActionResult)
  updateConsoleProxy(@Args('input') input: UpdateConsoleProxyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ConsoleProxyAgent',
      async (payload: UpdateConsoleProxyPayload, taskId: string) => {
        const { inventory } = await this.updateConsoleProxyAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'consoleProxyOverriddenIp',
          inventory
        }
      }
    )
    return { actionId }
  }
}
