import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryVolumeSnapshotTreeAction } from '@/api/zstack/QueryVolumeSnapshotTreeAction'

import { BlockSnapshot, BlockSnapshotList, QueryBlockSnapshotArgs } from './block-snapshot.model'
import { BlockSnapshotService } from './block-snapshot.service'

@Resolver(() => BlockSnapshot)
export class BlockSnapshotResolver {
  @Inject() blockSnapshotService: BlockSnapshotService
  @Inject() queryTreeAction: QueryVolumeSnapshotTreeAction

  // query list
  @Query(() => BlockSnapshotList)
  blockSnapshotList(@Args() queryArgs: QueryBlockSnapshotArgs) {
    return this.blockSnapshotService.queryList(queryArgs)
  }

  @ResolveField()
  async current(@Parent() snapshot: BlockSnapshot) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          value: snapshot.treeUuid
        }
      ]
    }

    const { inventories } = await this.queryTreeAction.call(queryArgs)

    return inventories[0].current
  }

  @ResolveField()
  async actualSize(@Parent() snapshot: BlockSnapshot) {
    return this.blockSnapshotService.getActualSize(snapshot.uuid)
  }
}
