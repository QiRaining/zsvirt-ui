import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryTpmArgs, TpmInventory } from './tpm.model'
import { TpmService } from './tpm.service'

@Resolver(() => TpmInventory)
export class TpmResolver {
  @Inject() tpmService: TpmService

  @Query(() => [TpmInventory])
  async tpmList(@Args() args: QueryTpmArgs) {
    const { list } = await this.tpmService.query(args)
    return list
  }
}
