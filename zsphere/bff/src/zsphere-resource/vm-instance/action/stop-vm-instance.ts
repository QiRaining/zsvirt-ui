import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  StopVmInstanceAction,
  StopVmInstanceActionParam,
  StopVmInstanceResult
} from '@/api/zstack/StopVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class StopVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  stopHA?: boolean
}

@InputType()
class StopVmInstanceInput {
  @Field(() => [StopVmInstancePayload])
  payload: StopVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class StopVmInstanceService extends ActionService {
  @Inject() stopVmInstanceAction: StopVmInstanceAction

  @Mutation(() => ActionResult)
  stopVmInstance(@Args('input') input: StopVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmInstance', async (payload: StopVmInstancePayload, taskId) => {
      const { uuid, stopHA } = payload
      const params: StopVmInstanceActionParam = { uuid }
      if (stopHA) {
        params.stopHA = 'true'
      }
      const result: StopVmInstanceResult = await this.stopVmInstanceAction.call(params, {
        actionId,
        taskId
      })
      return {
        id: uuid,
        fields: 'state',
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
