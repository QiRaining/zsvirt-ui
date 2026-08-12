import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { ScsiLunQueryService } from './scsi-lun-query/scsi-lun-query.service'
import { QueryScsiLunArgs, ScsiLunList, ScsiLun, LunDeviceMultiPathList } from './scsi-lun.model'

@Resolver(() => ScsiLun)
export class ScsiLunResolver {
  @Inject() scsiLunQueryService: ScsiLunQueryService

  @Query(() => ScsiLunList)
  async scsiLunList(@Args() queryArgs: QueryScsiLunArgs) {
    return this.scsiLunQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async healthState(@Parent() current: ScsiLun, @Args('hostUuid') hostUuid?: string) {
    if (!hostUuid) {
      return null
    }
    return await this.scsiLunQueryService.queryHealthState(current.uuid, hostUuid)
  }

  @Query(() => LunDeviceMultiPathList)
  async lunDeviceMultiPathList(@Args() queryArgs: QueryAction) {
    return this.scsiLunQueryService.getLunDeviceMultiPathList(queryArgs)
  }
}
