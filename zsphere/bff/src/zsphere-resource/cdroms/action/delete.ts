import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmCdRomAction } from '@/api/zstack/DeleteVmCdRomAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteCdRomPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteCdRomInput {
  @Field(() => [DeleteCdRomPayload])
  payload: DeleteCdRomPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteCdRomService extends ActionService {
  @Inject() deleteAction: DeleteVmCdRomAction

  @Mutation(() => ActionResult)
  deleteCdRoms(@Args('input') input: DeleteCdRomInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'CdRom',
      async (payload: DeleteCdRomPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: DeleteCdRomPayload, taskId: string, actionId: string) {
    const { uuid } = payload
    await this.deleteAction.call(
      {
        uuid
      },
      { actionId, taskId }
    )
    return {
      id: payload.uuid
    }
  }
}
