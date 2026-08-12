import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent, Int } from '@nestjs/graphql'

import { ImageMediaType } from '@/common/enum'
import { Condition as ICondition, QueryAction } from '@/common/model/action-query.model'
import { BackupStorageDataloader } from '@/hardware-resource/backup-storage/backup-storage.dataloader'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { ImageQueryService } from './image-query/image-query.service'
import {
  Image,
  ImageSummary,
  ImageList,
  QueryImageArgs,
  ImageBootMode,
  GuestOsTypeList,
  OsChildren,
  GuestOsCpuMemHotAddInfoList,
  ManagementNodeArch
} from './image.model'

@Resolver(() => Image)
export class ImageResolver {
  @Inject() imageQueryService: ImageQueryService
  @Inject() ownerDataLoader: OwnerDataLoader
  @Inject() backupStorageDataloader: BackupStorageDataloader

  @Query(() => Image)
  async image(@Args('uuid') uuid: string) {
    return this.imageQueryService.queryByUuid(uuid)
  }

  @Query(() => ImageList)
  async imageList(@Args() queryArgs: QueryImageArgs) {
    return this.imageQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async backupStorage(@Parent() image: Image) {
    return this.backupStorageDataloader.query(
      image.uuid,
      image.backupStorageRefs[0].backupStorageUuid
    )
  }

  // @ResolveField()
  // async owner(@Parent() image: Image) {
  //   return this.imageQueryService.getOwner(image.uuid)
  // }
  @ResolveField()
  async owner(@Parent() image: Image) {
    return this.ownerDataLoader.query(image.uuid)
  }

  @ResolveField()
  async bootMode(@Parent() image: Image) {
    return this.imageQueryService.getBootMode(image.uuid)
  }

  @ResolveField()
  async qga(@Parent() image: Image) {
    return this.imageQueryService.getQGA(image.uuid)
  }

  @ResolveField()
  async useFor(@Parent() image: Image) {
    return this.imageQueryService.getUseFor(image.uuid)
  }

  @ResolveField()
  async baremetal2Image(@Parent() image: Image) {
    return this.imageQueryService.getIsBaremetal2Image(image.uuid)
  }

  @ResolveField()
  async availableUserVm(@Parent() image: Image) {
    if (image?.mediaType === ImageMediaType.RootVolumeTemplate) {
      return this.imageQueryService.getAvailableUserVm(image.uuid)
    }
    return 0
  }

  @ResolveField()
  async toPublic(@Parent() image: Image) {
    const rt = await this.ownerDataLoader.queryResourceShareType(image.uuid)
    return rt === ShareType.Public
  }

  @ResolveField()
  async shareType(@Parent() image: Image) {
    return await this.ownerDataLoader.queryResourceShareType(image.uuid)
  }

  @ResolveField()
  async isZmigrateImage(@Parent() image: Image) {
    return this.imageQueryService.getIsZmigrateImage(image.uuid)
  }

  @Query(() => [ImageBootMode], { nullable: true, defaultValue: [] })
  async imageSupportBootModeForBareMetal2Instance() {
    return this.imageQueryService.queryImageSupportBootModeForBareMetal2Instance()
  }

  @Query(() => GuestOsTypeList)
  async guestOsTypeList() {
    return this.imageQueryService.getGuestOsTypes()
  }

  @Query(() => [OsChildren])
  async guestOsType(@Args('guestOs') guestOs: string) {
    return this.imageQueryService.getGuestOsDetial(guestOs)
  }

  @Query(() => [OsChildren])
  async guestNameList() {
    return this.imageQueryService.getGuestNameList()
  }

  @Query(() => ManagementNodeArch)
  async getManagementNodeArch(): Promise<ManagementNodeArch> {
    return await this.imageQueryService.getManagementNodeArch()
  }

  @Query(() => GuestOsCpuMemHotAddInfoList)
  async guestOsCpuMemHotAddInfoList(@Args() args: QueryAction) {
    return this.imageQueryService.getGuestOsCpuMemHotAddInfoList(args)
  }
}

@Resolver(() => ImageSummary)
export class ImageSummaryResolver {
  @Inject() imageQueryService: ImageQueryService

  @Query(() => ImageSummary)
  async getImageSummary(
    @Args({ name: 'conditions', type: () => [ICondition] })
    conditions: ICondition[]
  ) {
    return conditions || []
  }

  @ResolveField(() => Int)
  async total(conditions: [ICondition]) {
    return this.imageQueryService.getSummary('total', conditions)
  }

  @ResolveField(() => Int)
  async available(conditions: [ICondition]) {
    return await this.imageQueryService.getSummary('available', conditions)
  }

  @ResolveField(() => Int)
  async destroyed(@Parent() conditions) {
    return await this.imageQueryService.getSummary('destroyed', conditions)
  }

  @ResolveField(() => Int)
  async exported(@Parent() conditions) {
    return this.imageQueryService.getSummary('exported', conditions)
  }
}
