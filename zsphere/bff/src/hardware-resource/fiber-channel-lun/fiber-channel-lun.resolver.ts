import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { ScsiLunResolver } from '../scsi-lun/scsi-lun.resolver'
import { FiberChannelLunQueryService } from './fiber-channel-lun-query/fiber-channel-lun-query.service'
import {
  FiberChannelLun,
  FiberChannelLunList,
  QueryFiberChannelLunArgs
} from './fiber-channel-lun.model'

@Resolver(() => FiberChannelLun)
export class FiberChannelLunResolver extends ScsiLunResolver {
  @Inject() fiberChannelLunQueryService: FiberChannelLunQueryService

  @Query(() => FiberChannelLunList)
  async fiberChannelLunList(@Args() queryArgs: QueryFiberChannelLunArgs) {
    return this.fiberChannelLunQueryService.queryList(queryArgs)
  }
}
