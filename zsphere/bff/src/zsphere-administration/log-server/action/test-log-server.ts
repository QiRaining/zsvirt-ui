import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddLogServerAction } from '@/api/zstack/AddLogServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { callLogServerActionWithEncryptedRecord } from './log-server-encrypted-configuration'

@InputType()
class TestLogServerPayload {
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

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class TestLogServerInput {
  @Field(() => [TestLogServerPayload])
  payload: TestLogServerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class TestLogServerService extends ActionService {
  @Inject() action: AddLogServerAction

  @Mutation(() => ActionResult)
  testLogServer(@Args('input') input: TestLogServerInput) {
    const actionId = input.action.actionId
    const actionFn = async (payload: TestLogServerPayload, taskId: string) => {
      await callLogServerActionWithEncryptedRecord(this.action, payload, {
        actionId,
        taskId
      })
      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'LogServer', actionFn)
    return { actionId }
  }
}
