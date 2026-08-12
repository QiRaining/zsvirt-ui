import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { HardwareState } from '../host/host.model'
import { Memory, QueryMemoryArgs, QueryMemoryResp } from './memory.model'
import { MemoryService } from './memory.service'

@Resolver(() => Memory)
export class MemoryResolver {
  @Inject() memoryService: MemoryService

  @Query(() => QueryMemoryResp)
  async memoryList(@Args() args: QueryMemoryArgs) {
    return this.memoryService.memoryList(args)
  }

  @ResolveField(() => HardwareState)
  async state(@Parent() memory: Memory) {
    return this.memoryService.getState(memory)
  }
}
