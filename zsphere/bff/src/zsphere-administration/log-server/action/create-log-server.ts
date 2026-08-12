import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddLogServerAction } from '@/api/zstack/AddLogServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { callLogServerActionWithEncryptedRecord } from './log-server-encrypted-configuration'

@InputType()
class CreateLogServerPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  category: string

  @Field(() => String)
  type: string

  @Field(() => String)
  level: string

  @Field(() => String)
  configuration: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class CreateLogServerInput {
  @Field(() => CreateLogServerPayload)
  payload: CreateLogServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateLogServerService extends ActionService {
  @Inject() action: AddLogServerAction

  @Mutation(() => ActionResult)
  createLogServer(@Args('input') input: CreateLogServerInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateLogServerPayload, taskId: string) => {
      const { inventory } = await callLogServerActionWithEncryptedRecord(this.action, payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid,
        inventory
      }
    }

    this.actionHelper(input, 'LogServer', actionFn)
    return { actionId }
  }
}
