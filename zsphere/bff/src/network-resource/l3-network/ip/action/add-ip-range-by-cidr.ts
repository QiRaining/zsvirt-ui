import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddIpRangeByNetworkCidrAction } from '@/api/zstack/AddIpRangeByNetworkCidrAction'
import { AddIpv6RangeByNetworkCidrAction } from '@/api/zstack/AddIpv6RangeByNetworkCidrAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddIpRangeByCidrPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  networkCidr: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int)
  ipVersion: 4 | 6 | 46

  @Field(() => String, { nullable: true })
  addressMode?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true })
  tagUuids?: any[]

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  userTags?: any[]

  @Field(() => String, { nullable: true })
  ipAllocateStrategy?: string
}

@InputType()
class AddIpRangeByCidrInput {
  @Field(() => [AddIpRangeByCidrPayload])
  payload: AddIpRangeByCidrPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddIpRangeByCidrService extends ActionService {
  @Inject() addIpRangeByNetworkCidrAction: AddIpRangeByNetworkCidrAction
  @Inject() addIpv6RangeByNetworkCidrAction: AddIpv6RangeByNetworkCidrAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  addIpRangeByCidr(@Args('input') input: AddIpRangeByCidrInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddIpRangeByCidrPayload, taskId: string) => {
      const { ipVersion, ipAllocateStrategy, ...addIpRangeByCidrParams } = payload
      const fnMap = {
        4: 'addIpRangeByNetworkCidrAction',
        6: 'addIpv6RangeByNetworkCidrAction'
      }

      const fn: AddIpRangeByNetworkCidrAction = this[fnMap[ipVersion]]

      await fn.call(addIpRangeByCidrParams, {
        actionId,
        taskId
      })

      if (ipAllocateStrategy) {
        await this.updateResourceConfigAction.call(
          {
            resourceUuid: addIpRangeByCidrParams.l3NetworkUuid,
            name: 'ipAllocateStrategy',
            category: 'l3Network',
            value: ipAllocateStrategy
          },
          { actionId, taskId }
        )
      }

      return {
        id: 'xxx'
      }
    }

    this.actionHelper(input, 'IpRange', actionFn)
    return { actionId }
  }
}
