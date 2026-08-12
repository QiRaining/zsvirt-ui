import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReconnectConsoleProxyAgentAction } from '@/api/zstack/ReconnectConsoleProxyAgentAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ReconnectConsoleProxyPayload {
  @Field(() => [String], { nullable: true })
  agentUuids?: string[]
}

@InputType()
class ReconnectConsoleProxyInput {
  @Field(() => ReconnectConsoleProxyPayload)
  payload: ReconnectConsoleProxyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReconnectConsoleProxyService extends ActionService {
  @Inject() reconnectConsoleProxyAction: ReconnectConsoleProxyAgentAction

  @Mutation(() => ActionResult)
  reconnectConsoleProxy(@Args('input') input: ReconnectConsoleProxyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ConsoleProxyAgent',
      async (payload: ReconnectConsoleProxyPayload, taskId: string) => {
        const { agentUuids } = payload
        const { inventory } = await this.reconnectConsoleProxyAction.call(
          { agentUuids },
          { actionId, taskId }
        )
        return {
          id: payload.agentUuids?.[0]
        }
      }
    )
    return { actionId }
  }
}
