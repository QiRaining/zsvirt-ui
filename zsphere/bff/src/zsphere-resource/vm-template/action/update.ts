import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Int, Mutation } from '@nestjs/graphql'

import { UpdateTemplatedVmInstanceAction } from '@/api/zstack/UpdateTemplatedVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateVmTemplatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number
}

@InputType()
export class UpdateVmTemplateInput {
  @Field(() => UpdateVmTemplatePayload)
  payload: UpdateVmTemplatePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmTemplateService extends ActionService {
  @Inject() update: UpdateTemplatedVmInstanceAction

  @Mutation(() => ActionResult)
  updateVmTemplate(@Args('input') input: UpdateVmTemplateInput) {
    const actionId = input?.action?.actionId
    this.actionHelper(
      input,
      'VmTemplate',
      async (payload: UpdateVmTemplatePayload, taskId: string) => {
        return this.updateTemplatedVMFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async updateTemplatedVMFn(
    { ...payload }: UpdateVmTemplatePayload,
    taskId: string,
    actionId: string
  ) {
    const result = await this.update.call({ ...payload }, { actionId, taskId })
    return {
      id: payload.uuid,
      fields: 'name,description,state,platform,guestOsType,cpuNum,memorySize,lastOpDate',
      inventory: result.inventory
    }
  }
}
