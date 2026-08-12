import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql'

import { NVMeLunQueryService } from './nvme-lun-query.service'
import { NVMeLun, NVMeLunList, QueryNVMeLunArgs } from './nvme-lun.model'

@Resolver(() => NVMeLun)
export class NVMeLunResolver {
  @Inject() nvmeLunQueryService: NVMeLunQueryService

  @Query(() => NVMeLunList)
  async nvmeLunList(@Args() queryArgs: QueryNVMeLunArgs) {
    return this.nvmeLunQueryService.queryList(queryArgs)
  }

  @ResolveField()
  async nvmeServer(@Parent() nvmeLun: NVMeLun) {
    return this.nvmeLunQueryService.queryNVMeServer(nvmeLun.nvmeTargetUuid)
  }
}
