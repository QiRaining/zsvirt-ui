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
class PoweroffVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  stopHA?: boolean
}

@InputType()
class PoweroffVmInstanceInput {
  @Field(() => [PoweroffVmInstancePayload])
  payload: PoweroffVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class PoweroffVmInstanceService extends ActionService {
  @Inject() stopVmInstanceAction: StopVmInstanceAction

  @Mutation(() => ActionResult)
  poweroffVmInstance(@Args('input') input: PoweroffVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmInstance', async (payload: PoweroffVmInstancePayload, taskId) => {
      const { uuid, stopHA } = payload
      const params: StopVmInstanceActionParam = { uuid }
      if (stopHA) {
        params.stopHA = 'true'
      }
      params.type = 'cold'
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
