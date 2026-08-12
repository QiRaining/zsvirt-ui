import { Inject } from '@nestjs/common'
import { Resolver, Args, Query } from '@nestjs/graphql'

import { QueryCCSCertificateAction } from '@/api/zstack/QueryCCSCertificateAction'
import { QueryAction } from '@/common/model/action-query.model'
import { CCSCertificate } from '@/identity/model/login.model'

@Resolver(() => CCSCertificate)
export class CCSCertificateResolver {
  @Inject()
  queryCCSCertificateAction: QueryCCSCertificateAction

  /**
   * @param queryArgs
   */
  @Query(() => CCSCertificate)
  async ccsCertificate(@Args() queryArgs: QueryAction) {
    const resp = await this.queryCCSCertificateAction.call(queryArgs)
    return resp?.inventories?.[0] ?? null
  }
}
