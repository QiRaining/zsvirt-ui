import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmCustomSpecificationAction } from '@/api/zstack/DeleteVmCustomSpecificationAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteVmCustomSpecificationPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteVmCustomSpecificationInput {
  @Field(() => [DeleteVmCustomSpecificationPayload])
  payload: DeleteVmCustomSpecificationPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmCustomSpecificationService extends ActionService {
  @Inject()
  private deleteVmCustomSpecificationAction: DeleteVmCustomSpecificationAction

  @Mutation(() => ActionResult)
  deleteVmCustomSpecification(@Args('input') input: DeleteVmCustomSpecificationInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmCustomSpecification',
      async (payload: DeleteVmCustomSpecificationPayload, taskId: string) => {
        await this.deleteVmCustomSpecificationAction.call(payload, {
          actionId,
          taskId
        })
        return { id: payload.uuid }
      },
      { listenerType: 'delete' }
    )
    return { actionId }
  }
}
