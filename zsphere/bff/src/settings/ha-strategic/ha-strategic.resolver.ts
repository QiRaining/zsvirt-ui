import { Inject } from '@nestjs/common'
import { Resolver, Args, Query, Mutation } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { HAStrategic, HAStrategicInput } from '@/settings/ha-strategic/ha-strategic.model'
import { HAStrategicService } from '@/settings/ha-strategic/ha-strategic.service'

@Resolver(() => HAStrategic)
export class HAStrategicResolver {
  @Inject() haStrategicService: HAStrategicService

  @Query(() => HAStrategic)
  async haStrategic(@Args() queryArgs: QueryAction) {
    return this.haStrategicService.queryHAStrategic(queryArgs)
  }

  @Mutation(() => ActionResult)
  enableHAStrategic(@Args('input') input: HAStrategicInput) {
    const actionId = input.action.actionId
    this.haStrategicService.enableHAStrategic(input)
    return { actionId }
  }
}
