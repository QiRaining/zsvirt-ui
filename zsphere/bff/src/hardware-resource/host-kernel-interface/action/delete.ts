import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteHostKernelInterfaceAction } from '@/api/zstack/DeleteHostKernelInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteHostKernelInterfacePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteHostKernelInterfaceInput {
  @Field(() => [DeleteHostKernelInterfacePayload])
  payload: DeleteHostKernelInterfacePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteHostKernelInterfaceService extends ActionService {
  @Inject() deleteHostKernelInterfaceAction: DeleteHostKernelInterfaceAction

  @Mutation(() => ActionResult)
  deleteHostKernelInterface(@Args('input') input: DeleteHostKernelInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostKernelInterface',
      async (payload: DeleteHostKernelInterfacePayload, taskId: string) => {
        await this.deleteHostKernelInterfaceAction.call(payload, {
          actionId,
          taskId
        })
        return { id: payload.uuid }
      }
    )
    return { actionId }
  }
}
