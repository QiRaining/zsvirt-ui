import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  CreateSNSSnmpPlatformAction,
  CreateSNSApplicationPlatformResult
} from '@/api/zstack/CreateSNSSnmpPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateSnmpTrapReceiverPayload {
  @Field(() => String)
  name: string

  @Field(() => Int)
  snmpPort: number

  @Field(() => String)
  snmpAddress: string
}

@InputType()
class CreateSnmpTrapReceiverInput {
  @Field(() => [CreateSnmpTrapReceiverPayload])
  payload: CreateSnmpTrapReceiverPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSnmpTrapReceiverService extends ActionService {
  @Inject() createSnmpTrapReceiverAction: CreateSNSSnmpPlatformAction

  @Mutation(() => ActionResult)
  createSnmpTrapReceiver(@Args('input') input: CreateSnmpTrapReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpTrap',
      async (payload: CreateSnmpTrapReceiverPayload, taskId: string) => {
        try {
          const result: CreateSNSApplicationPlatformResult =
            await this.createSnmpTrapReceiverAction.call({ ...payload }, { actionId, taskId })
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
