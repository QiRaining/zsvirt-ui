import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ExpungeVmInstanceAction } from '@/api/zstack/ExpungeVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExpungeVmInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ExpungeVmInstanceInput {
  @Field(() => [ExpungeVmInstancePayload])
  payload: ExpungeVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
// 彻底删除云主机
export class ExpungeVmInstanceService extends ActionService {
  @Inject() expungeVmInstanceAction: ExpungeVmInstanceAction

  @Mutation(() => ActionResult)
  expungeVmInstance(@Args('input') input: ExpungeVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ExpungeVmInstancePayload, taskId: string) => {
        const { uuid } = payload

        await this.expungeVmInstanceAction.call({ uuid }, { actionId, taskId })

        return {
          id: payload.uuid,
          inventory: {
            actionType: 'delete',
            id: payload.uuid
          }
        }
      },
      {
        listenerType: 'ExpungeVmInstance'
      }
    )
    return {
      actionId
    }
  }
}
