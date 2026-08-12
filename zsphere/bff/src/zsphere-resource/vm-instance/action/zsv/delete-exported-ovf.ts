import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteImagePackageAction } from '@/api/zstack/DeleteImagePackageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteExportVmInstanceFromOvfPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteExportVmInstanceFromOvfInput {
  @Field(() => [DeleteExportVmInstanceFromOvfPayload])
  payload: DeleteExportVmInstanceFromOvfPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteExportedOvfService extends ActionService {
  @Inject()
  deleteImagePackageAction: DeleteImagePackageAction

  @Mutation(() => ActionResult)
  deleteExportedOvf(@Args('input') input: DeleteExportVmInstanceFromOvfInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DeleteExportVmInstanceFromOvfPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteImagePackageAction.call(
          {
            uuid
          },
          { actionId, taskId }
        )
        return {
          id: uuid
        }
      }
    )
    return { actionId }
  }
}
