import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ReimageVmInstanceAction } from '@/api/zstack/ReimageVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ReimageVmInstancePayload {
  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
class ReimageVmInstanceInput {
  @Field(() => ReimageVmInstancePayload)
  payload: ReimageVmInstancePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReimageVmInstanceService extends ActionService {
  @Inject() reimageVmInstanceAction: ReimageVmInstanceAction

  @Mutation(() => ActionResult)
  reimageVmInstance(@Args('input') input: ReimageVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ReimageVmInstancePayload, taskId: string) => {
        const { vmInstanceUuid } = payload
        await this.reimageVmInstanceAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: vmInstanceUuid
        }
      }
    )
    return { actionId }
  }
}
