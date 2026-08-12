import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { CustomColumnsConfig } from './custom-columns.model'
import { CustomColumnsService } from './custom-columns.service'

@Resolver(() => CustomColumnsConfig)
export class CustomColumnsResolver {
  @Inject() customColumnsService: CustomColumnsService

  @Query(() => CustomColumnsConfig)
  async queryCustomColumnConfig(): Promise<CustomColumnsConfig> {
    return this.customColumnsService.query()
  }
}
