import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { AddIpRangeAction } from '@/api/zstack/AddIpRangeAction'
import { AddIpv6RangeAction } from '@/api/zstack/AddIpv6RangeAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddIpRangePayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  netmask: string

  @Field(() => Int, { nullable: true })
  prefixLen?: number

  @Field(() => String, { nullable: true })
  addressMode?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  startIp: string

  @Field(() => String)
  endIp: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int)
  ipVersion: 4 | 6 | 46

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => [String], { nullable: true, description: 'tagUuids' })
  tagUuids?: any[]

  @Field(() => [String], { nullable: true, description: 'systemTags' })
  systemTags?: any[]

  @Field(() => [String], { nullable: true, description: 'userTags' })
  userTags?: any[]

  @Field(() => String, { nullable: true })
  ipAllocateStrategy?: string
}

@InputType()
class AddIpRangeInput {
  @Field(() => [AddIpRangePayload])
  payload: AddIpRangePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddIpRangeService extends ActionService {
  @Inject() addIpRangeAction: AddIpRangeAction
  @Inject() addIpv6RangeAction: AddIpv6RangeAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  addIpRange(@Args('input') input: AddIpRangeInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddIpRangePayload, taskId: string) => {
      const { ipVersion, ipAllocateStrategy, ...addIpRangeParams } = payload
      const fnMap = {
        4: 'addIpRangeAction',
        6: 'addIpv6RangeAction'
      }

      const fn: AddIpRangeAction = this[fnMap[ipVersion]]

      await fn.call(addIpRangeParams, {
        actionId,
        taskId
      })

      if (ipAllocateStrategy) {
        await this.updateResourceConfigAction.call(
          {
            resourceUuid: addIpRangeParams.l3NetworkUuid,
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
