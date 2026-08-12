import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmSshKeyAction } from '@/api/zstack/DeleteVmSshKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteVmSshKeyPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteVmSshKeyInput {
  @Field(() => DeleteVmSshKeyPayload)
  payload: DeleteVmSshKeyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmSshKeyService extends ActionService {
  @Inject() deleteVmSshKeyAction: DeleteVmSshKeyAction

  @Mutation(() => ActionResult)
  deleteVmSshKey(@Args('input') input: DeleteVmSshKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DeleteVmSshKeyPayload, taskId: string) => {
        const { uuid } = payload
        await this.deleteVmSshKeyAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: uuid,
          fields: 'systemTag { sshkey }',
          inventory: { systemTag: { sshkey: null } }
        }
      }
    )
    return { actionId }
  }
}
