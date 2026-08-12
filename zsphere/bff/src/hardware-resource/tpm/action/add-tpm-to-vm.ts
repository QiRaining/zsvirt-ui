import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddTpmAction } from '@/api/zstack/AddTpmAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AddTpmToVmPayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  keyProviderUuid?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string
}

@InputType()
class AddTpmToVmInput {
  @Field(() => AddTpmToVmPayload)
  payload: AddTpmToVmPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddTpmToVmService extends ActionService {
  @Inject() addTpmAction: AddTpmAction

  @Mutation(() => ActionResult)
  addTpmToVm(@Args('input') input: AddTpmToVmInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Tpm',
      async (payload: AddTpmToVmPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: AddTpmToVmPayload, taskId: string, actionId: string) {
    const { vmInstanceUuid, keyProviderUuid, resourceUuid } = payload
    const result = await this.addTpmAction.call(
      { vmInstanceUuid, keyProviderUuid, resourceUuid },
      { actionId, taskId }
    )
    return {
      id: result?.inventory?.uuid ?? payload.vmInstanceUuid
    }
  }
}
