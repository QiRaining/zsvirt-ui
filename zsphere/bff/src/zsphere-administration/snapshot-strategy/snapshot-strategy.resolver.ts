import { Inject } from '@nestjs/common'
import { Args, Resolver, Query, Parent, ResolveField } from '@nestjs/graphql'

import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { SnapshotStrategyQueryService } from './query/snapshot-strategy-query.service'
import {
  SnapshotStrategy,
  SnapshotStrategyList,
  QuerySnapshotStrategyArgs
} from './snapshot-strategy.model'

@Resolver(() => SnapshotStrategy)
export class SnapshotStrategyResolver {
  @Inject() snapshotStrategyQueryService: SnapshotStrategyQueryService
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => SnapshotStrategyList)
  snapshotStrategyList(@Args() queryArgs: QuerySnapshotStrategyArgs) {
    return this.snapshotStrategyQueryService.query(queryArgs)
  }

  @ResolveField()
  jobs(@Parent() parent: SnapshotStrategy) {
    return this.snapshotStrategyQueryService.querySnapshotStrategyJob(parent.uuid)
  }

  @ResolveField()
  triggers(@Parent() parent: SnapshotStrategy) {
    const uuid = parent.triggersUuid[0]
    if (!uuid) {
      return []
    }
    return this.snapshotStrategyQueryService.querySnapshotStrategyTrigger(uuid)
  }

  @ResolveField()
  owner(@Parent() parent: SnapshotStrategy) {
    return this.ownerDataLoader.query(parent.uuid)
  }
}
