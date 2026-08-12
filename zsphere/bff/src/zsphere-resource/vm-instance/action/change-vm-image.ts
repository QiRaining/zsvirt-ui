import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ChangeVmImageAction, ChangeVmImageResult } from '@/api/zstack/ChangeVmImageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeVmImagePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String)
  imageUuid: string
}

@InputType()
class ChangeVmImageInput {
  @Field(() => [ChangeVmImagePayload])
  payload: ChangeVmImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVmImageService extends ActionService {
  @Inject() changeVmImageAction: ChangeVmImageAction

  @Mutation(() => ActionResult)
  changeVmImage(@Args('input') input: ChangeVmImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: ChangeVmImagePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: ChangeVmImagePayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, imageUuid } = payload
    const result: ChangeVmImageResult = await this.changeVmImageAction.call(
      { vmInstanceUuid, imageUuid },
      { actionId, taskId }
    )
    return {
      id: payload.vmInstanceUuid,
      fields: 'imageUuid,platform,guestOsType',
      inventory: result.inventory
    }
  }
}
