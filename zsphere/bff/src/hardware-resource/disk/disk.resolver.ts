import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import {
  Disk,
  QueryDiskArgs,
  QueryDiskResp,
  QueryHostBlockDevicesResp,
  QueryHostBlockDevicesArgs
} from './disk.model'
import { DiskService } from './disk.service'

@Resolver(() => Disk)
export class DiskResolver {
  @Inject() diskService: DiskService

  @Query(() => QueryDiskResp)
  async diskList(@Args() args: QueryDiskArgs) {
    return this.diskService.diskList(args)
  }

  @Query(() => QueryHostBlockDevicesResp)
  async hostBlockDevicesList(@Args() args: QueryHostBlockDevicesArgs) {
    return this.diskService.hostBlockDevicesList(args)
  }
}
