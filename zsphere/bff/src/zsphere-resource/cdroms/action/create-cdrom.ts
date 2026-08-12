import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateVmCdRomAction } from '@/api/zstack/CreateVmCdRomAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateVmCdRomPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  isoUuid?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string
}

@InputType()
export class CreateVmCdRomInput {
  @Field(() => [CreateVmCdRomPayload])
  payload: CreateVmCdRomPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVmCdRomService extends ActionService {
  @Inject() createVmCdRomAction: CreateVmCdRomAction

  @Mutation(() => ActionResult)
  createVmCdRom(@Args('input') input: CreateVmCdRomInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'CdRom',
      async (payload: CreateVmCdRomPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: CreateVmCdRomPayload, taskId: string, actionId: string) {
    const { inventory } = await this.createVmCdRomAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: inventory.uuid,
      inventory
    }
  }
}
