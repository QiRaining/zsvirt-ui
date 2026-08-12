import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ChangeVmPasswordAction } from '@/api/zstack/ChangeVmPasswordAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeVmPasswordPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  account: string

  @Field(() => String)
  password: string
}

@InputType()
class ChangeVmPasswordInput {
  @Field(() => ChangeVmPasswordPayload)
  payload: ChangeVmPasswordPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVmPasswordService extends ActionService {
  @Inject() changeVmPasswordAction: ChangeVmPasswordAction

  @Mutation(() => ActionResult)
  changeVmPassword(@Args('input') input: ChangeVmPasswordInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ChangeVmPasswordPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: ChangeVmPasswordPayload, taskId: string, actionId: string) {
    await this.changeVmPasswordAction.call({ ...payload }, { actionId, taskId })
    return {
      id: payload.uuid
    }
  }
}
