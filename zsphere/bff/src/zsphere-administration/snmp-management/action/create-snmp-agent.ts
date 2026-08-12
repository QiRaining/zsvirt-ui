import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { CreateSnmpAgentAction, CreateSnmpAgentResult } from '@/api/zstack/CreateSnmpAgentAction'
import {
  CreateSNSSnmpPlatformAction,
  CreateSNSApplicationPlatformResult
} from '@/api/zstack/CreateSNSSnmpPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class TrapParam {
  @Field(() => String)
  name: string

  @Field(() => Int)
  snmpPort: number

  @Field(() => String)
  snmpAddress: string
}

@InputType()
class CreateSnmpAgentPayload {
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

  @Field(() => [TrapParam], { nullable: true, defaultValue: [] })
  trapList?: TrapParam[]
}

@InputType()
class CreateSnmpAgentInput {
  @Field(() => CreateSnmpAgentPayload)
  payload: CreateSnmpAgentPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSnmpAgentService extends ActionService {
  @Inject() createSnmpAgentAction: CreateSnmpAgentAction
  @Inject() createSnmpTrapReceiverAction: CreateSNSSnmpPlatformAction

  @Mutation(() => ActionResult)
  createSnmpAgent(@Args('input') input: CreateSnmpAgentInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpAgent',
      async (payload: CreateSnmpAgentPayload, taskId: string) => {
        const { trapList, ...createSnmpAgentPayload } = payload
        try {
          const result: CreateSnmpAgentResult = await this.createSnmpAgentAction.call(
            { ...createSnmpAgentPayload },
            { actionId, taskId }
          )
          if (trapList?.length) {
            const tasks = []
            trapList.forEach(trap => {
              tasks.push(this.createSnmpTrapReceiverAction.call({ ...trap }, { actionId, taskId }))
            })
            await Promise.all(tasks)
          }
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
