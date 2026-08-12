import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  ConvertTemplatedVmInstanceToVmInstanceAction,
  ConvertTemplatedVmInstanceToVmInstanceResult
} from '@/api/zstack/ConvertTemplatedVmInstanceToVmInstanceAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { VmCreationStrategy } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
//import { UpdateVmInstanceAction } from '@/api/zstack/UpdateVmInstanceAction'

@InputType()
class ConverTemplateToVMPayload {
  @Field(() => String)
  vmTemplateUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  templateUuid?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => VmCreationStrategy, { nullable: true })
  strategy?: VmCreationStrategy

  @Field(() => Boolean, { nullable: true })
  resetTpm?: boolean
}

@InputType()
class ConverTemplateToVMInput {
  @Field(() => [ConverTemplateToVMPayload])
  payload: ConverTemplateToVMPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ConverTemplateToVMService extends ActionService {
  @Inject()
  convertVmInstanceToVmTemplateAction: ConvertTemplatedVmInstanceToVmInstanceAction
  @Inject()
  startVmInstanceAction: StartVmInstanceAction
  //updateVmInstanceAction: UpdateVmInstanceAction

  @Mutation(() => ActionResult)
  coverTemplateToVM(@Args('input') input: ConverTemplateToVMInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmTemplate',
      async (payload: ConverTemplateToVMPayload, taskId: string) => {
        const { vmTemplateUuid, name, strategy, resetTpm } = payload
        const result: ConvertTemplatedVmInstanceToVmInstanceResult =
          await this.convertVmInstanceToVmTemplateAction.call(
            {
              templatedVmInstanceUuid: vmTemplateUuid,
              name,
              ...(resetTpm != null ? { resetTpm } : {})
            },
            { actionId, taskId }
          )
        // const result: UpdateVmInstanceResult = await this.updateVmInstanceAction.call(
        //   { uuid, isTemplate: false },//模版转为虚拟机
        //   { actionId, taskId }
        // )

        if (strategy === VmCreationStrategy.InstantStart) {
          await this.startVmInstanceAction.call(
            {
              uuid: vmTemplateUuid,
              hostUuid: payload.hostUuid
            },
            { actionId, taskId }
          )
        }
        return {
          id: payload.vmTemplateUuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
