import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import {
  MdevDeviceSpec,
  MdevDeviceSpecQueryResp,
  QueryMdevDeviceSpecArgs
} from './mdev-device-spec.model'
import { MdevDeviceSpecService } from './mdev-device-spec.service'

@Resolver(() => MdevDeviceSpec)
export class MdevDeviceSpecResolver {
  @Inject() mdevDeviceSpecService: MdevDeviceSpecService

  @Query(() => MdevDeviceSpecQueryResp)
  async mdevDeviceSpecList(@Args() queryArgs: QueryMdevDeviceSpecArgs) {
    return this.mdevDeviceSpecService.queryMdevDeviceSpec(queryArgs)
  }
}
