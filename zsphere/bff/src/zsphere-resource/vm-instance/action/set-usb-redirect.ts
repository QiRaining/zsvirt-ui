import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmUsbRedirectAction } from '@/api/zstack/SetVmUsbRedirectAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmUsbRedirectPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  enable: boolean
}

@InputType()
class SetVmUsbRedirectInput {
  @Field(() => [SetVmUsbRedirectPayload])
  payload: SetVmUsbRedirectPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmUsbRedirectService extends ActionService {
  @Inject() setVmUsbRedirectAction: SetVmUsbRedirectAction

  @Mutation(() => ActionResult)
  setVmUsbRedirect(@Args('input') input: SetVmUsbRedirectInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmUsbRedirectPayload, taskId: string) => {
        return this.actionFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async actionFn(payload: SetVmUsbRedirectPayload, taskId: string, actionId: string) {
    await this.setVmUsbRedirectAction.call({ ...payload }, { actionId, taskId })
    return {
      id: payload.uuid,
      fields: 'systemTag { usbRedirect }',
      inventory: {
        systemTag: {
          usbRedirect: payload.enable
        }
      }
    }
  }
}
