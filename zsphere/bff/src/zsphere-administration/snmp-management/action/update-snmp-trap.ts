import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  UpdateSNSSnmpPlatformAction,
  UpdateSNSApplicationPlatformResult
} from '@/api/zstack/UpdateSNSSnmpPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSnmpTrapReceiverPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => Int)
  snmpPort: number

  @Field(() => String)
  snmpAddress: string
}

@InputType()
class UpdateSnmpTrapReceiverInput {
  @Field(() => UpdateSnmpTrapReceiverPayload)
  payload: UpdateSnmpTrapReceiverPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSnmpTrapReceiverService extends ActionService {
  @Inject() updateSnmpTrapReceiverAction: UpdateSNSSnmpPlatformAction

  @Mutation(() => ActionResult)
  updateSnmpTrapReceiver(@Args('input') input: UpdateSnmpTrapReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpTrap',
      async (payload: UpdateSnmpTrapReceiverPayload, taskId: string) => {
        try {
          const result: UpdateSNSApplicationPlatformResult =
            await this.updateSnmpTrapReceiverAction.call({ ...payload }, { actionId, taskId })
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
