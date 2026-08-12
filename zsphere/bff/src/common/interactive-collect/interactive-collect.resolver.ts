import { Inject, Injectable } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import { InteractiveCollectQueryService } from './interactive-collect.service'

@Injectable()
@Resolver()
export class InteractiveCollectResolver {
  @Inject() interactiveCollectQueryService: InteractiveCollectQueryService

  @Query(() => Boolean)
  async interactiveCollectorStatus() {
    return this.interactiveCollectQueryService.getCollectInteractiveTriggerStatus()
  }
}
