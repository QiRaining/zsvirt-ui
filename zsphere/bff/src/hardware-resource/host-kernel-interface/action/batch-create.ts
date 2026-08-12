import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { BatchCreateHostKernelInterfaceAction } from '@/api/zstack/BatchCreateHostKernelInterfaceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { KernelTrafficTypes } from '../host-kernel-interface.model'

@InputType()
export class BatchCreateHostKernelInterfaceStruct {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  ip6?: string

  @Field(() => String, { nullable: true })
  ip6Prefix?: string
}

@InputType()
export class BatchCreateHostKernelInterfacePayload {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => [KernelTrafficTypes], { defaultValue: [] })
  trafficTypes: KernelTrafficTypes[]

  @Field(() => [BatchCreateHostKernelInterfaceStruct], { defaultValue: [] })
  structs: BatchCreateHostKernelInterfaceStruct[]
}

@InputType()
export class BatchCreateHostKernelInterfaceInput {
  @Field(() => BatchCreateHostKernelInterfacePayload)
  payload: BatchCreateHostKernelInterfacePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class BatchCreateHostKernelInterfaceService extends ActionService {
  @Inject()
  batchCreateHostKernelInterfaceAction: BatchCreateHostKernelInterfaceAction

  @Mutation(() => ActionResult)
  batchCreateHostKernelInterface(@Args('input') input: BatchCreateHostKernelInterfaceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostKernelInterface',
      async (payload: BatchCreateHostKernelInterfacePayload, taskId: string) => {
        const result = await this.batchCreateHostKernelInterfaceAction.call(payload, {
          actionId,
          taskId
        })

        return {
          id: result?.results?.[0]?.id,
          inventory: result?.results?.[0]?.inventory
        }
      }
    )
    return { actionId }
  }
}
