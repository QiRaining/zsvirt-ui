import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateHostKernelInterfaceAction } from '@/api/zstack/CreateHostKernelInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { KernelTrafficTypes } from '../host-kernel-interface.model'

@InputType()
export class CreateHostKernelInterfacePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  hostUuid: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  requiredIp?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => [KernelTrafficTypes], { defaultValue: [] })
  trafficTypes: KernelTrafficTypes[]
}

@InputType()
export class CreateHostKernelInterfaceInput {
  @Field(() => CreateHostKernelInterfacePayload)
  payload: CreateHostKernelInterfacePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateHostKernelInterfaceService extends ActionService {
  @Inject() createHostKernelInterfaceAction: CreateHostKernelInterfaceAction

  @Mutation(() => ActionResult)
  createHostKernelInterface(@Args('input') input: CreateHostKernelInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostKernelInterface',
      async (payload: CreateHostKernelInterfacePayload, taskId: string) => {
        const result = await this.createHostKernelInterfaceAction.call(payload, {
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
