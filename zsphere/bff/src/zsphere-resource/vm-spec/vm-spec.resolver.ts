import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { VmSpecQueryService } from './query/vm-spec-query.service'
import { VmCustomSpecification, VmCustomSpecificationResp } from './vm-spec.model'

@Resolver(() => VmCustomSpecification)
export class VmSpecResolver {
  @Inject() private queryVmSpecService: VmSpecQueryService

  @Query(() => VmCustomSpecificationResp)
  async vmSpecList(@Args() queryArgs: QueryAction) {
    return this.queryVmSpecService.query(queryArgs)
  }
}
