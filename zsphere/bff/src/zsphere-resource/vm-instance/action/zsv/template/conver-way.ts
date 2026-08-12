import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ConvertVmInstanceToTemplatedVmInstanceAction } from '@/api/zstack/ConvertVmInstanceToTemplatedVmInstanceAction'
//import { UpdateVmInstanceAction } from '@/api/zstack/UpdateVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class VMConverToTemplatePayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class VMConverToTemplateInput {
  @Field(() => [VMConverToTemplatePayload])
  payload: VMConverToTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class VMConverToTemplateService extends ActionService {
  @Inject()
  convertVmInstanceToVmTemplateAction: ConvertVmInstanceToTemplatedVmInstanceAction
  //updateVmInstanceAction: UpdateVmInstanceActionConvertVmInstanceToTemplatedVmInstanceAction

  @Mutation(() => ActionResult)
  coverVmToTemplate(@Args('input') input: VMConverToTemplateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: VMConverToTemplatePayload, taskId: string) => {
        const { uuid } = payload
        const result = await this.convertVmInstanceToVmTemplateAction.call(
          { vmInstanceUuid: uuid },
          { actionId, taskId }
        )
        // const result: UpdateVmInstanceResult = await this.updateVmInstanceAction.call(
        //   { uuid, isTemplate: true },
        //   { actionId, taskId }
        // )
        return {
          id: payload.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
