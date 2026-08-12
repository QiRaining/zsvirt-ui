import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateTpmAction } from '@/api/zstack/UpdateTpmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateTpmPayload {
  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  tpmUuid?: string

  @Field(() => String, { nullable: true })
  keyProviderUuid?: string
}

@InputType()
class UpdateTpmInput {
  @Field(() => UpdateTpmPayload)
  payload: UpdateTpmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateTpmService extends ActionService {
  @Inject() updateTpmAction: UpdateTpmAction

  @Mutation(() => ActionResult)
  updateTpm(@Args('input') input: UpdateTpmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Tpm',
      async (payload: UpdateTpmPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: UpdateTpmPayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, tpmUuid, keyProviderUuid } = payload
    const result = await this.updateTpmAction.call(
      { vmInstanceUuid, tpmUuid, keyProviderUuid },
      { actionId, taskId }
    )
    return {
      id: result?.inventory?.uuid ?? payload.tpmUuid ?? payload.vmInstanceUuid
    }
  }
}
