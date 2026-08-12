import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import * as _ from 'lodash'

import { QueryAction } from '@/common/model/action-query.model'
import { BackupStorage } from '@/hardware-resource/backup-storage/backup-storage.model'
import { ClusterDataloader } from '@/hardware-resource/cluster/cluster.dataloader'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { PrimaryStorageDataloader } from '@/hardware-resource/primary-storage/primary-storage.dataloader'
import { PrimaryStorage } from '@/hardware-resource/primary-storage/primary-storage.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import {
  BackupDataFormImageStorage,
  BackupDataFormImageStorageResp
} from '@/network-resource/virtual-router-offering/virtual-router-offering.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { AccountOwner } from '@/zsphere-administration/owner/owner.model'
import { InstanceOfferingDataloader } from '@/zsphere-resource/instance-offering/instance-offering.dataloader'
import { InstanceOffering } from '@/zsphere-resource/instance-offering/instance-offering.model'
import { VmInstanceDataloader } from '@/zsphere-resource/vm-instance/vm-instance.dataloader'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'
import { Volume } from '@/zsphere-resource/volume/model/volume.model'
import { VolumeDataloader } from '@/zsphere-resource/volume/volume.dataloader'

import { BackupDataQueryService } from './backup-data-query/backup-data-query.service'
import {
  BackupData,
  BackupDatabase,
  BackupDatabaseResponse,
  BackupDataCanSync,
  BackupDataIsLocalSynced,
  BackupDataIsRemoteSynced,
  // DeleteBackupInput,
  BackupDataResponse,
  BackupResourceData,
  BackupResourceDataResponse,
  BackupResourceFullBackupType,
  BackupResourceVmBackupType,
  QueryBackupResourceArgs,
  QueryVolumeBackupArgs,
  VolumeBackupDataSummary,
  VolumeBackupDataSummaryArgs,
  BackupTaskStatus
} from './backup-data.model'
import { BackupDataService } from './backup-data.service'
import { BackupSourceDataQueryService } from './backup-source-data-query/backup-source-data-query.service'
import { DatabaseBackupQueryService } from './database-backup-query/database-backup-query.service'

@Resolver(() => BackupData)
export class BackupDataResolver {
  @Inject() backupDataQueryService: BackupDataQueryService
  @Inject() backupDataService: BackupDataService
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() l3NetworkDataloader: L3NetworkDataloader
  @Inject() instanceOfferingDataloader: InstanceOfferingDataloader
  @Inject() vmInstanceDataloader: VmInstanceDataloader
  @Inject() volumeDataloader: VolumeDataloader
  @Inject() primaryStorageDataloader: PrimaryStorageDataloader
  @Inject() clusterDataloader: ClusterDataloader

  @Query(() => BackupDataResponse)
  backupDataList(@Args() args: QueryVolumeBackupArgs) {
    return this.backupDataQueryService.queryList(args)
  }

  @ResolveField(() => AccountOwner, { nullable: true })
  async owner(@Parent() p: BackupData) {
    return this.ownerDataLoader.query(p.uuid)
  }

  @ResolveField()
  async isIncludeDataVolume(@Parent() backupData: BackupData) {
    // metadata 不存在的时候认为不包含。
    const metadata = backupData?.metadata
    const isIncludeDataVolume =
      String(metadata).indexOf('dataVolumeUuids":[') > -1
        ? BackupResourceVmBackupType.Include
        : BackupResourceVmBackupType.NotInclude
    return isIncludeDataVolume
  }

  @ResolveField(() => BackupStorage, {
    description: '本地备份服务器',
    nullable: true
  })
  async localBackupStorage(@Parent() backupData: BackupData) {
    return this.backupDataQueryService.getLocalBackupStorage(backupData?.uuid)
  }

  @ResolveField(() => BackupStorage, {
    description: '远端备份服务器',
    nullable: true
  })
  async remoteBackupStorage(@Parent() backupData: BackupData) {
    return this.backupDataQueryService.getRemoteBackupStorage(backupData?.uuid)
  }

  @ResolveField()
  async backupType(@Parent() backupData: BackupData) {
    const _backupType =
      backupData?.mode === 'full'
        ? BackupResourceFullBackupType.Full
        : BackupResourceFullBackupType.Incremental
    return _backupType
  }

  @ResolveField(() => BackupDataIsRemoteSynced, {
    description: '是否同步到远端'
  })
  async isRemoteSynced(@Parent() backupData: BackupData) {
    return this.backupDataQueryService.inRemote(backupData?.uuid)
    // return this.backupDataService.isRemoteSynced(
    //   p.uuid,
    //   BackupResourceType.VmInstance
    // )
  }

  @ResolveField(() => BackupDataIsLocalSynced, {
    description: '是否同步到本地'
  })
  async isLocalSynced(@Parent() backupData: BackupData) {
    return this.backupDataQueryService.inLocal(backupData?.uuid)
    // return this.backupDataService.isLocalSynced(
    //   p.uuid,
    //   BackupResourceType.VmInstance
    // )
  }

  @ResolveField(() => BackupDataCanSync, { description: '能否同步到远端' })
  async canSyncToRemote(@Parent() backupData: BackupData) {
    return this.backupDataQueryService.getCanSyncToRemote(backupData?.uuid)
  }

  @ResolveField(() => [L3Network], { nullable: true, description: '' })
  async l3NetworkList(@Parent() p: BackupData) {
    const { vmNics } = JSON.parse(p.metadata)
    if (!vmNics) {
      return null
    }
    return vmNics
      .map(async ({ uuid, l3NetworkUuid }) => {
        const l3Network = await this.l3NetworkDataloader.query(uuid, l3NetworkUuid)
        //对于删除的资源返回uuid
        // if (!l3Network) {
        //   return { uuid: l3NetworkUuid }
        // }
        return l3Network
      })
      .filter(Boolean)
  }

  @ResolveField(() => InstanceOffering, { nullable: true, description: '' })
  async instanceOffering(@Parent() p: BackupData) {
    const { instanceOfferingUuid } = JSON.parse(p.metadata)
    if (!instanceOfferingUuid) {
      return null
    }
    const instanceOffering = await this.instanceOfferingDataloader.query(
      p.uuid,
      instanceOfferingUuid
    )
    // if (!instanceOffering) {
    //   return { uuid: instanceOfferingUuid }
    // }
    return instanceOffering
  }

  @ResolveField(() => VmInstance, { nullable: true, description: '' })
  async vmInstance(@Parent() p: BackupData) {
    if (!p.vmInstanceUuid) {
      return null
    }
    const vmInstance = await this.vmInstanceDataloader.query(p.uuid, p.vmInstanceUuid)
    // if (!vmInstance) {
    //   return { uuid: vmInstanceUuid }
    // }
    return vmInstance
  }

  @ResolveField(() => VmInstance, { nullable: true, description: '' })
  async volumeBackupVmInstance(@Parent() p: BackupData) {
    const { volumeUuid } = p
    if (!volumeUuid) {
      return null
    }

    return this.backupDataService.dataVolumeBackupVmInstance(volumeUuid)
  }

  @ResolveField(() => PrimaryStorage, { nullable: true, description: '' })
  async primaryStorage(@Parent() p: BackupData) {
    const { primaryStorageUuid } = JSON.parse(p.metadata)
    if (!primaryStorageUuid) {
      return null
    }
    const primaryStorage = await this.primaryStorageDataloader.query(p.uuid, primaryStorageUuid)
    // if (!primaryStorage) {
    //   return { uuid: primaryStorageUuid }
    // }
    return primaryStorage
  }

  @ResolveField(() => Cluster, { nullable: true, description: '' })
  async cluster(@Parent() p: BackupData) {
    const { clusterUuid } = JSON.parse(p.metadata)
    if (!clusterUuid) {
      return null
    }
    const cluster = await this.clusterDataloader.query(p.uuid, clusterUuid)
    // if (!cluster) {
    //   return { uuid: clusterUuid }
    // }
    return cluster
  }

  @ResolveField(() => Volume, { nullable: true, description: '' })
  async volume(@Parent() p: BackupData) {
    const { volumeUuid } = p
    if (!volumeUuid) {
      return null
    }
    const volume = await this.volumeDataloader.query(p.uuid, volumeUuid)
    // if (!volume) {
    //   return { uuid: volumeUuid }
    // }
    return volume
  }
  @ResolveField(() => [Volume], { nullable: true, description: '' })
  async dataVolumeList(@Parent() p: BackupData) {
    const { dataVolumeUuids } = JSON.parse(p.metadata)
    if (!dataVolumeUuids) {
      return null
    }
    return dataVolumeUuids
      .map(async uuid => {
        const volume = await this.volumeDataloader.query(uuid, uuid)
        return volume
      })
      .filter(Boolean)
  }

  @ResolveField(() => Boolean, { nullable: true, description: '' })
  async dataVolumeAllExisted(@Parent() p: BackupData) {
    const { groupUuid, type } = p
    const { dataVolumeUuids } = JSON.parse(p.metadata)
    let dataVolumeAllExisted = !groupUuid
    if (type === 'Root' && groupUuid) {
      const volumeUuids = await this.backupDataService.dataVolumeAllExisted(groupUuid)

      dataVolumeAllExisted =
        _.isEqual(_.toString(dataVolumeUuids.sort()), _.toString(volumeUuids.sort())) &&
        volumeUuids.length > 0
    }

    return dataVolumeAllExisted
  }

  @ResolveField()
  async dataVolumeBackup(@Parent() backupData: BackupData) {
    if (backupData.type !== 'Root' || !backupData.groupUuid) {
      return undefined
    }
    return this.backupDataQueryService.getDataVolumeBackup(backupData.groupUuid)
  }

  @ResolveField(() => Boolean, { nullable: true, description: '' })
  async lostData(@Parent() p: BackupData) {
    const { groupUuid, type } = p
    const { vmInstanceUuid, dataVolumeUuids } = JSON.parse(p.metadata)

    let lostData = false
    if (type === 'Root') {
      lostData = await this.backupDataService.lostData(vmInstanceUuid, groupUuid, dataVolumeUuids)
    }
    return lostData
  }

  @ResolveField()
  async isLocalLatest(@Parent() backupData: BackupData) {
    if (!backupData.vmInstanceUuid || !backupData.groupUuid) {
      return false
    }
    const localLatest = await this.backupDataQueryService.getLocalLatest(backupData.vmInstanceUuid)
    return backupData.groupUuid === localLatest?.groupUuid
  }

  @ResolveField()
  async isRemoteLatest(@Parent() backupData: BackupData) {
    if (!backupData.vmInstanceUuid || !backupData.groupUuid) {
      return false
    }
    const remoteLatest = await this.backupDataQueryService.getRemoteLatest(
      backupData.vmInstanceUuid
    )
    return backupData.groupUuid === remoteLatest?.groupUuid
  }

  @Query(() => String, { nullable: true })
  getbackupDataRecoverLocalHostUuid(
    @Args({ name: 'vmInstanceUuid' }) vmInstanceUuid: string,
    @Args({ name: 'clusterUuid' }) clusterUuid: string
  ) {
    return this.backupDataService.getbackupDataRecoverLocalHostUuid(vmInstanceUuid, clusterUuid)
  }

  @Query(() => Boolean)
  thinProvisionByPrimaryStorage(@Args({ name: 'primaryStorageUuid' }) primaryStorageUuid: string) {
    return this.backupDataService.getThinProvisionByPrimaryStorage(primaryStorageUuid)
  }
  @Query(() => BackupTaskStatus)
  backupTaskStatus(
    @Args({ name: 'isVm', nullable: true }) isVm: boolean,
    @Args({ name: 'rootVolumeUuids', type: () => [String], nullable: true })
    rootVolumeUuids: string[],
    @Args({ name: 'dataVolumeUuids', type: () => [String], nullable: true })
    dataVolumeUuids: string[]
  ) {
    return this.backupDataService.backupTaskStatus(isVm, rootVolumeUuids, dataVolumeUuids)
  }
}

@Resolver(() => VolumeBackupDataSummary)
export class VolumeBackupDataSummaryResolver {
  @Inject() backupSourceDataQueryService: BackupSourceDataQueryService

  @Query(() => VolumeBackupDataSummary)
  async getVolumeBackupDataSize(@Args() args: VolumeBackupDataSummaryArgs) {
    return await this.backupSourceDataQueryService.getBackupDataSize(args)
  }
}

@Resolver(() => BackupResourceData)
export class BackupResourceDataResolver {
  @Inject() backupDataService: BackupDataService
  @Inject() backupSourceDataQueryService: BackupSourceDataQueryService
  @Inject() vmInstanceDataloader: VmInstanceDataloader

  @Query(() => BackupResourceDataResponse)
  backupResourceDataList(@Args() args: QueryBackupResourceArgs) {
    return this.backupSourceDataQueryService.queryList(args)
    // return this.backupDataService.queryBackupResourceData(args)
  }

  // @ResolveField(() => String, {
  //   description: '根据资源来查询的话是没有正确的uuid的，所以用资源uuid代替'
  // })
  // async uuid(@Parent() backupResourceData: BackupResourceData) {
  //   return backupResourceData?.volumeUuid || backupResourceData?.vmInstanceUuid
  //   // return this.backupSourceDataQueryService.getUuid(
  //   //   backupResourceData?.volumeUuid
  //   // )
  // }

  @ResolveField()
  async vmInstance(@Parent() data: BackupResourceData) {
    const vmInstance = await this.vmInstanceDataloader.query(data.uuid, data.uuid)
    return vmInstance
  }

  @ResolveField(() => String)
  async volumeUuid(@Parent() backupResourceData: BackupResourceData) {
    if (!!backupResourceData?.volumeUuid) {
      return backupResourceData?.volumeUuid
    }
  }

  @ResolveField(() => String)
  async vmInstanceUuid(@Parent() backupResourceData: BackupResourceData) {
    if (!!backupResourceData?.vmInstanceUuid) {
      return backupResourceData?.vmInstanceUuid
    }
  }

  @ResolveField(() => String)
  async volumeBackupUuids(@Parent() backupResourceData: BackupResourceData) {
    return this.backupSourceDataQueryService.getVolumeBackupUuids(backupResourceData?.volumeUuid)
  }

  @ResolveField(() => String)
  async name(@Parent() backupResourceData: BackupResourceData) {
    if (!!backupResourceData?.volumeUuid) {
      return await this.backupSourceDataQueryService.getNameByVolume(backupResourceData?.volumeUuid)
    } else if (!!backupResourceData?.vmInstanceUuid) {
      return await this.backupSourceDataQueryService.getNameByVm(backupResourceData?.vmInstanceUuid)
    } else {
      return null
    }
  }
}

@Resolver(() => BackupDatabase)
export class BackupDatabaseResolver {
  @Inject() backupDataService: BackupDataService
  @Inject() databaseBackupQueryService: DatabaseBackupQueryService

  @Query(() => BackupDatabaseResponse)
  backupDatabaseList(@Args() args: QueryAction) {
    return this.databaseBackupQueryService.queryList(args)
  }

  @ResolveField(() => BackupDataIsRemoteSynced, {
    description: '是否在远端'
  })
  async isRemoteSynced(@Parent() databaseBackup: BackupDatabase) {
    return this.databaseBackupQueryService.inRemote(databaseBackup.uuid)
  }

  @ResolveField(() => BackupDataCanSync, { description: '能否同步到远端' })
  async canSyncToRemote(@Parent() databaseBackup: BackupDatabase) {
    return this.databaseBackupQueryService.getCanSyncToRemote(databaseBackup?.uuid)
  }

  @ResolveField(() => BackupDataIsLocalSynced, {
    description: '是否在本地'
  })
  async isLocalSynced(@Parent() databaseBackup: BackupDatabase) {
    return this.databaseBackupQueryService.inLocal(databaseBackup.uuid)
  }

  @ResolveField(() => BackupStorage, {
    description: '本地备份服务器',
    nullable: true
  })
  async localBackupStorage(@Parent() databaseBackup: BackupDatabase) {
    return this.databaseBackupQueryService.getLocalBackupStorage(databaseBackup?.uuid)
  }

  @ResolveField(() => BackupStorage, {
    description: '远端备份服务器',
    nullable: true
  })
  async remoteBackupStorage(@Parent() databaseBackup: BackupDatabase) {
    return this.databaseBackupQueryService.getRemoteBackupStorage(databaseBackup?.uuid)
  }

  @Query(() => Boolean)
  canScanDatabaseBackup() {
    return this.backupDataService.canScanDatabaseBackup()
  }

  @Query(() => String)
  getConsoleLog(@Args({ name: 'first' }) first: boolean) {
    return this.backupDataService.getConsoleLog(first)
  }

  @Query(() => String)
  exportDatabaseBackupFromBackupStorage(
    @Args({ name: 'uuid' }) uuid: string,
    @Args({ name: 'backupStorageUuid', nullable: true })
    backupStorageUuid?: string
  ) {
    return this.backupDataService.exportDatabaseBackupFromBackupStorage(uuid, backupStorageUuid)
  }
}

@Resolver(() => BackupDataFormImageStorage)
export class BackupDataFormImageStorageResolver {
  @Inject() databaseBackupQueryService: DatabaseBackupQueryService

  @Query(() => BackupDataFormImageStorageResp)
  async getDatabaseBackupFromImageStore(
    @Args() queryArgs: QueryAction
  ): Promise<BackupDataFormImageStorageResp> {
    return await this.databaseBackupQueryService.getDatabaseBackupFromImageStore(queryArgs)
  }
}
