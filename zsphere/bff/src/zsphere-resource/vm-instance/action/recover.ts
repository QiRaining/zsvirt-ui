import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RecoverVmInstanceAction,
  RecoverVmInstanceResult
} from '@/api/zstack/RecoverVmInstanceAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RecoverVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  startVm: boolean
}

@InputType()
class RecoverVmInstanceInput {
  @Field(() => [RecoverVmInstancePayload])
  payload: RecoverVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
// 恢复已删除的云主机
export class RecoverVmInstanceService extends ActionService {
  @Inject() recoverVmInstanceAction: RecoverVmInstanceAction
  @Inject() startVmInstanceAction: StartVmInstanceAction

  @Mutation(() => ActionResult)
  recoverVmInstance(@Args('input') input: RecoverVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: RecoverVmInstancePayload, taskId: string) => {
        const { uuid, startVm } = payload
        const result: RecoverVmInstanceResult = await this.recoverVmInstanceAction.call(
          { uuid },
          { actionId, taskId }
        )
        if (startVm) {
          await this.startVmInstanceAction.call({ uuid }, { actionId, taskId })
        }
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
