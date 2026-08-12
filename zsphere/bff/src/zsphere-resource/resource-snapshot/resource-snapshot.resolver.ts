import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent, CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import { CheckMemorySnapshotGroupConflictAction } from '@/api/zstack/CheckMemorySnapshotGroupConflictAction'
import { QueryVolumeSnapshotTreeAction } from '@/api/zstack/QueryVolumeSnapshotTreeAction'
import { QueryAction } from '@/common/model/action-query.model'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'

import {
  VmInstanceByVolumeDataloader,
  VmInstanceDataloader
} from '../vm-instance/vm-instance.dataloader'
import { VmInstance } from '../vm-instance/vm-instance.model'
import { Volume } from '../volume/model/volume.model'
import { VolumeDataloader } from '../volume/volume.dataloader'
import { ZSVResourceSnapshotQueryService } from './resource-snapshot-query/zsv-snapshot-query.service'
import {
  SnapshotGroupDataloader,
  SnapshotGroupSizeDataloader
} from './resource-snapshot.dataloader'
import {
  VolumeSnapshot,
  VolumeSnapshotGroup,
  VolumeSnapshotListResp,
  SnapshotGroupByVolumeList,
  SnapshotGroupByVolume,
  VolumeSnapshotTreeListResp,
  SnapshotType,
  SnapshotDeleteNeedSize,
  GetSnapshotDeleteNeedSizeArgs,
  VolumeSnapshotTree,
  VolumeSnapshotGroupListResp,
  CheckMemorySnapshotGroupConflictResult,
  CheckMemorySnapshotGroupConflictArgs
} from './resource-snapshot.model'
import { QuerySnapshotArgs } from './resource-snapshot.model'
import { ResourcesnapshotService } from './resource-snapshot.service'

@Resolver(VolumeSnapshot)
export class VolumeSnapshotResolver {
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService
  @Inject() resourcesnapshotService: ResourcesnapshotService
  @Inject() volumeDataLoader: VolumeDataloader
  @Inject() snapshotGroupDataloader: SnapshotGroupDataloader
  @Inject() snapshotGroupSizeDataloader: SnapshotGroupSizeDataloader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() queryTreeAction: QueryVolumeSnapshotTreeAction

  @Query(() => VolumeSnapshotListResp)
  async volumeSnapshotList(@Args() queryArgs: QueryAction) {
    return await this.zsvResourceSnapshotQueryService.queryList(queryArgs)
  }

  @Query(() => VolumeSnapshot)
  async volumeSnapshot(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          value: uuid
        }
      ]
    }
    const {
      list: [sanpshot]
    } = await this.zsvResourceSnapshotQueryService.queryList(queryArgs)
    return sanpshot
  }

  @ResolveField(() => Volume)
  async volume(@Parent() snapshot: VolumeSnapshot) {
    return this.volumeDataLoader.query(snapshot.uuid, snapshot.volumeUuid)
  }

  @ResolveField(() => SnapshotType)
  async snapshotType(@Parent() snapshot: VolumeSnapshot) {
    if (snapshot.groupUuid) {
      return SnapshotType.Group
    } else {
      return SnapshotType.Single
    }
  }

  @ResolveField(() => VolumeSnapshotGroup)
  async group(@Parent() snapshot: VolumeSnapshot) {
    if (snapshot.groupUuid) {
      return this.snapshotGroupDataloader.query(snapshot.groupUuid)
    }
  }

  @ResolveField()
  async primaryStorage(@Parent() snapshot: VolumeSnapshot) {
    return this.primaryStorageDataloader.query(snapshot.uuid, snapshot.primaryStorageUuid)
  }

  @ResolveField()
  async current(@Parent() snapshot: VolumeSnapshot) {
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
  async actualSize(@Parent() snapshot: VolumeSnapshot) {
    return this.zsvResourceSnapshotQueryService.getActualSize(snapshot.uuid)
  }
}

@Resolver(VolumeSnapshotTree)
export class VolumeSnapshotTreeListResolver {
  @Inject() resourcesnapshotService: ResourcesnapshotService
  @Inject() volumeDataLoader: VolumeDataloader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader

  @Query(() => VolumeSnapshotTreeListResp)
  async zsvVolumeSnapshotTree(@Args() queryArgs: QueryAction) {
    const { list, total } = await this.resourcesnapshotService.querySnapshotTree(queryArgs)

    list.forEach(item => {
      item.primaryStorageUuid = item.tree?.inventory?.primaryStorageUuid
      item.tree.inventory.current = item?.current
      item.tree = JSON.stringify(item.tree)
    })
    return {
      list,
      total
    }
  }

  @ResolveField(() => Volume)
  async volume(@Parent() snapshot: VolumeSnapshotTree) {
    return this.volumeDataLoader.query(snapshot.uuid, snapshot.volumeUuid)
  }

  @ResolveField()
  async primaryStorage(@Parent() snapshot: VolumeSnapshotTree) {
    return this.primaryStorageDataloader.query(snapshot.uuid, snapshot.primaryStorageUuid)
  }
}

@Resolver(VolumeSnapshotGroup)
export class VolumeSnapshotGroupResolver {
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService
  @Inject() snapshotGroupSizeDataloader: SnapshotGroupSizeDataloader
  @Inject() vmInstanceDataLoader: VmInstanceDataloader

  @Query(() => VolumeSnapshotGroup)
  async volumeSnapshotGroup(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          value: uuid
        }
      ]
    }
    const {
      list: [sanpshotGroup]
    } = await this.zsvResourceSnapshotQueryService.queryGroupList(queryArgs)
    return sanpshotGroup
  }

  @Query(() => VolumeSnapshotGroupListResp)
  async volumeSnapshotGroupList(@Args() queryArgs: QueryAction) {
    return await this.zsvResourceSnapshotQueryService.queryGroupList(queryArgs)
  }

  @ResolveField(() => SnapshotType)
  async snapshotType() {
    return SnapshotType.Group
  }

  @ResolveField()
  async totalSize(@Parent() snapshotGroup: VolumeSnapshotGroup) {
    return this.snapshotGroupSizeDataloader.query(snapshotGroup.uuid)
  }

  @ResolveField()
  async vmInstance(@Parent() snapshotGroup: VolumeSnapshotGroup) {
    return this.vmInstanceDataLoader.query(snapshotGroup.uuid, snapshotGroup.vmInstanceUuid)
  }
}

@Resolver(() => SnapshotDeleteNeedSize)
export class GetSnapshotDeleteNeedSize {
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService

  @Query(() => SnapshotDeleteNeedSize)
  async getSnapshotDeleteNeedSize(@Args() queryArgs: GetSnapshotDeleteNeedSizeArgs) {
    return await this.zsvResourceSnapshotQueryService.getSnapshotDeleteNeedSize(queryArgs)
  }
}

//---zsv---
@Resolver(() => VolumeSnapshot)
export class ZSVSnapshotResolver {
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService

  @Query(() => VolumeSnapshotListResp)
  async zsvSnapshotList(@Args() queryArgs: QueryAction) {
    return await this.zsvResourceSnapshotQueryService.queryList(queryArgs)
  }
}

@Resolver(SnapshotGroupByVolume)
export class ZSVSnapshotGroupByVolumeResolver {
  @Inject() zsvResourceSnapshotQueryService: ZSVResourceSnapshotQueryService
  @Inject() volumeDataLoader: VolumeDataloader
  @Inject() vmInstanceByVolumeDataloader: VmInstanceByVolumeDataloader

  @Query(() => SnapshotGroupByVolumeList)
  async zsvSnapshotGroupList(@Args() queryArgs: QuerySnapshotArgs) {
    return await this.zsvResourceSnapshotQueryService.queryListGroupByVolume(queryArgs)
  }

  @ResolveField(() => VmInstance)
  async vm(@Parent() snapshot: SnapshotGroupByVolume) {
    return this.vmInstanceByVolumeDataloader.query(snapshot.volumeUuid, snapshot.volumeUuid)
  }
}

@Resolver()
export class MemorySnapshotGroupConflictResolver {
  @Inject()
  checkMemorySnapshotGroupConflictAction: CheckMemorySnapshotGroupConflictAction

  @Query(() => CheckMemorySnapshotGroupConflictResult)
  async checkMemorySnapshotGroupConflict(@Args() args: CheckMemorySnapshotGroupConflictArgs) {
    const result = await this.checkMemorySnapshotGroupConflictAction.call({
      uuid: args.uuid
    })
    return {
      vmNicConflict: (result?.vmNicConflict ?? []).map(item => ({
        ip: item.ip,
        mac: item.mac,
        vmInstanceUuid: item.vmInstanceUuid,
        vmInstanceName: item.vmInstanceName,
        vmNicName: item.vmNicName
      }))
    }
  }
}
