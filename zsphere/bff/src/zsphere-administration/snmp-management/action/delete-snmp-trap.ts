import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  DeleteSNSApplicationPlatformAction
  // DeleteSnmpTrapReceiverResult
} from '@/api/zstack/DeleteSNSApplicationPlatformAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSnmpTrapReceiverPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteSnmpTrapReceiverInput {
  @Field(() => [DeleteSnmpTrapReceiverPayload])
  payload: DeleteSnmpTrapReceiverPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteSnmpTrapReceiverService extends ActionService {
  @Inject() deleteSnmpTrapReceiverAction: DeleteSNSApplicationPlatformAction

  @Mutation(() => ActionResult)
  deleteSnmpTrapReceiver(@Args('input') input: DeleteSnmpTrapReceiverInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SnmpTrap',
      async (payload: DeleteSnmpTrapReceiverPayload, taskId: string) => {
        try {
          await this.deleteSnmpTrapReceiverAction.call({ ...payload }, { actionId, taskId })
          return {
            id: payload?.uuid
          }
        } catch (e) {
          console.log(e)
        }
      }
    )
    return { actionId }
  }
}
