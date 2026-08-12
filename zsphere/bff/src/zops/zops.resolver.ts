import { Inject, Injectable } from '@nestjs/common'
import { Resolver, Query } from '@nestjs/graphql'

import { ZOpsService } from './zops.service'

@Injectable()
@Resolver()
export class ZOpsResolver {
  @Inject() zopsService: ZOpsService

  @Query(() => Boolean)
  async zopsSupportable() {
    return this.zopsService.supportable()
  }
}
