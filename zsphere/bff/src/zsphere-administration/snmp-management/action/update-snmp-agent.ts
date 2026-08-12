import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { UpdateSnmpAgentAction, UpdateSnmpAgentResult } from '@/api/zstack/UpdateSnmpAgentAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSnmpAgentPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int)
  port: number

  @Field(() => String)
  version: string

  @Field(() => String, { nullable: true })
  readCommunity?: string

  @Field(() => String, { nullable: true })
  userName?: string

  @Field(() => String, { nullable: true })
  authAlgorithm?: string

  @Field(() => String, { nullable: true })
  authPassword?: string

  @Field(() => String, { nullable: true })
  privacyAlgorithm?: string

  @Field(() => String, { nullable: true })
  privacyPassword?: string
}

@InputType()
class UpdateSnmpAgentInput {
  @Field(() => UpdateSnmpAgentPayload)
  payload: UpdateSnmpAgentPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSnmpAgentService extends ActionService {
  @Inject() updateSnmpAgentAction: UpdateSnmpAgentAction

  @Mutation(() => ActionResult)
  updateSnmpAgent(@Args('input') input: UpdateSnmpAgentInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpAgent',
      async (payload: UpdateSnmpAgentPayload, taskId: string) => {
        try {
          const result: UpdateSnmpAgentResult = await this.updateSnmpAgentAction.call(
            { ...payload },
            { actionId, taskId }
          )
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
