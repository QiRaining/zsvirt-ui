import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmInstanceDefaultCdRomAction } from '@/api/zstack/SetVmInstanceDefaultCdRomAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class SetVmInstanceDefaultCdRomPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
export class SetVmInstanceDefaultCdRomInput {
  @Field(() => SetVmInstanceDefaultCdRomPayload)
  payload: SetVmInstanceDefaultCdRomPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmInstanceDefaultCdRomService extends ActionService {
  @Inject() setDefaultAction: SetVmInstanceDefaultCdRomAction

  @Mutation(() => ActionResult)
  setVmInstanceDefaultCdRom(@Args('input') input: SetVmInstanceDefaultCdRomInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'CdRom',
      async (payload: SetVmInstanceDefaultCdRomPayload, taskId: string) => {
        const { uuid, vmInstanceUuid } = payload
        await this.setDefaultAction.call(
          {
            uuid,
            vmInstanceUuid
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
