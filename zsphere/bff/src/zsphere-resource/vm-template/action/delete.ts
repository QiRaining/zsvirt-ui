import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteTemplatedVmInstanceAction } from '@/api/zstack/DeleteTemplatedVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteVmTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteVmTemplateInput {
  @Field(() => [DeleteVmTemplatePayload])
  payload: DeleteVmTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmTemplateService extends ActionService {
  @Inject()
  delete: DeleteTemplatedVmInstanceAction

  @Mutation(() => ActionResult)
  deleteVmTemplate(@Args('input') input: DeleteVmTemplateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmTemplate',
      async (payload: DeleteVmTemplatePayload, taskId: string) => {
        await this.delete.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
