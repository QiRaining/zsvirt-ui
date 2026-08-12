import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { ScsiLunResolver } from '../scsi-lun/scsi-lun.resolver'
import { IscsiLunQueryService } from './iscsi-lun-query/iscsi-lun-query.service'
import { IscsiLun, IscsiLunList, QueryIscsiLunArgs } from './iscsi-lun.model'

@Resolver(() => IscsiLun)
export class IscsiLunResolver extends ScsiLunResolver {
  @Inject() iscsiLunQueryService: IscsiLunQueryService

  @Query(() => IscsiLunList)
  async iscsiLunList(@Args() queryArgs: QueryIscsiLunArgs) {
    return this.iscsiLunQueryService.queryList(queryArgs)
  }
}
