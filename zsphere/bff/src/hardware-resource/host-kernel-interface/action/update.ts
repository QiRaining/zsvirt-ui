import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateHostKernelInterfaceAction } from '@/api/zstack/UpdateHostKernelInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { KernelTrafficTypes } from '../host-kernel-interface.model'

@InputType()
export class UpdateHostKernelInterfacePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  requiredIp?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => [KernelTrafficTypes], { nullable: true })
  trafficTypes?: KernelTrafficTypes[]
}

@InputType()
export class UpdateHostKernelInterfaceInput {
  @Field(() => UpdateHostKernelInterfacePayload)
  payload: UpdateHostKernelInterfacePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateHostKernelInterfaceService extends ActionService {
  @Inject() updateHostKernelInterfaceAction: UpdateHostKernelInterfaceAction

  @Mutation(() => ActionResult)
  updateHostKernelInterface(@Args('input') input: UpdateHostKernelInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostKernelInterface',
      async (payload: UpdateHostKernelInterfacePayload, taskId: string) => {
        const result = await this.updateHostKernelInterfaceAction.call(payload, {
          actionId,
          taskId
        })

        return {
          id: result?.inventory?.uuid
        }
      }
    )
    return { actionId }
  }
}
