import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmSshKeyAction } from '@/api/zstack/SetVmSshKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmSshKeyPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  SshKey: string
}

@InputType()
class SetVmSshKeyInput {
  @Field(() => SetVmSshKeyPayload)
  payload: SetVmSshKeyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmSshKeyService extends ActionService {
  @Inject() setVmSshKeyAction: SetVmSshKeyAction

  @Mutation(() => ActionResult)
  setVmSshKey(@Args('input') input: SetVmSshKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmSshKeyPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetVmSshKeyPayload, taskId: string, actionId: string) {
    const { uuid, SshKey } = payload
    await this.setVmSshKeyAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: uuid,
      fields: 'systemTag { sshkey }',
      inventory: { systemTag: { sshkey: SshKey } }
    }
  }
}
