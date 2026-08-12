import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ResumeVmInstanceAction, ResumeVmInstanceResult } from '@/api/zstack/ResumeVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ResumeVmInstancePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ResumeVmInstanceInput {
  @Field(() => [ResumeVmInstancePayload])
  payload: ResumeVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}
// 恢复已暂停的云主机
export class ResumeVmInstanceService extends ActionService {
  @Inject() resumeVmInstanceAction: ResumeVmInstanceAction

  @Mutation(() => ActionResult)
  resumeVmInstance(@Args('input') input: ResumeVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ResumeVmInstancePayload, taskId: string) => {
        const { uuid } = payload
        const result: ResumeVmInstanceResult = await this.resumeVmInstanceAction.call(
          { uuid },
          { actionId, taskId }
        )
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
