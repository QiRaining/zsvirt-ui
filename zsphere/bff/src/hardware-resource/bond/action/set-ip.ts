import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetIpOnHostNetworkBondingAction } from '@/api/zstack/SetIpOnHostNetworkBondingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class IpConfigPayload {
  @Field(() => String, { nullable: true })
  ipAddress?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class SetIpOnBondPayload extends IpConfigPayload {
  @Field(() => String)
  bondingUuid: string
}

@InputType()
export class SetIpOnBondInput {
  @Field(() => [SetIpOnBondPayload])
  payload: SetIpOnBondPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetIpOnBondService extends ActionService {
  @Inject() setIpAction: SetIpOnHostNetworkBondingAction

  @Mutation(() => ActionResult)
  setIpOnBond(@Args('input') input: SetIpOnBondInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Bond', async (payload: SetIpOnBondPayload, taskId: string) => {
      await this.setIpAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload?.bondingUuid
      }
    })
    return { actionId }
  }
}
