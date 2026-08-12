import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmHostnameAction } from '@/api/zstack/DeleteVmHostnameAction'
import { SetVmHostnameAction } from '@/api/zstack/SetVmHostnameAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmHostnamePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  hostname: string
}

@InputType()
class SetVmHostnameInput {
  @Field(() => [SetVmHostnamePayload])
  payload: SetVmHostnamePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmHostnameService extends ActionService {
  @Inject() setVmHostnameAction: SetVmHostnameAction
  @Inject() deleteVmHostnameAction: DeleteVmHostnameAction

  @Mutation(() => ActionResult)
  setVmHostname(@Args('input') input: SetVmHostnameInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmHostnamePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetVmHostnamePayload, taskId: string, actionId: string) {
    if (payload.hostname) {
      await this.setVmHostnameAction.call(payload, { actionId, taskId })
    } else {
      await this.deleteVmHostnameAction.call({ uuid: payload.uuid }, { actionId, taskId })
    }
    return {
      id: payload.uuid
    }
  }
}
