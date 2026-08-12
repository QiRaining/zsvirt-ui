import { Inject } from '@nestjs/common'
import { Args, Float, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { Op } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'

import { HybridKeySecretDataLoader } from './hybrid-key-secret.dataloader'
import { EndpointQueryService } from './query/query.service'
import {
  DingTalkEndPoint,
  EndPoint,
  FeiShuEndPoint,
  QueryEndPointEmailAddressResp,
  QueryEndPointResp,
  QueryEndPointSmsAddressList,
  SmsAK,
  SmsEndPoint,
  WeComEndPoint
} from './zwatch-endpoint.model'
import { EndPointService } from './zwatch-endpoint.service'

@Resolver()
export class EndPointResolver {
  @Inject() endPointService: EndPointService
  @Inject() endpointQueryService: EndpointQueryService
  @Inject() hybridKeySecretDataLoader: HybridKeySecretDataLoader

  @Query(() => QueryEndPointResp)
  async querySNSApplicationEndpointList(
    @Args() queryArgs: QueryAction
  ): Promise<QueryEndPointResp> {
    return this.endpointQueryService.queryList(queryArgs)
  }

  @Query(() => EndPoint)
  async snsApplicationEndpoint(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }

    const result = await this.endpointQueryService.queryList(queryArgs)

    return result?.list?.[0]
  }

  @Query(() => QueryEndPointEmailAddressResp)
  async queryEndpointEmailAddressList(
    @Args() queryArgs: QueryAction
  ): Promise<QueryEndPointEmailAddressResp> {
    return this.endpointQueryService.queryEndpointEmailAddressList(queryArgs)
  }

  @Query(() => QueryEndPointSmsAddressList)
  async queryEndpointSmsAddressList(
    @Args() queryArgs: QueryAction
  ): Promise<QueryEndPointSmsAddressList> {
    return this.endpointQueryService.queryEndpointSmsAddressList(queryArgs)
  }
}

@Resolver(() => WeComEndPoint)
export class WeComEndPointResolver extends EndPointResolver {
  @ResolveField(() => Float, { nullable: true })
  async atPersonListCount(
    @Parent()
    endPoint: WeComEndPoint
  ): Promise<number | null> {
    return endPoint.atPersonList?.length

    // return await this.endpointQueryService.getAtPersonListCount(
    //   endPoint.uuid,
    //   endPoint.type
    // )
  }
}

@Resolver(() => FeiShuEndPoint)
export class FeiShuEndPointResolver extends EndPointResolver {
  @ResolveField(() => Float, { nullable: true })
  async atPersonListCount(
    @Parent()
    endPoint: FeiShuEndPoint
  ): Promise<number | null> {
    return endPoint.atPersonList?.length

    // return await this.endpointQueryService.getAtPersonListCount(
    //   endPoint.uuid,
    //   endPoint.type
    // )
  }
}

@Resolver(() => DingTalkEndPoint)
export class DingTalkEndPointResolver extends EndPointResolver {
  @ResolveField(() => Float, { nullable: true })
  async atPersonListCount(
    @Parent()
    endPoint: DingTalkEndPoint
  ): Promise<number | null> {
    return endPoint.atPersonList?.length

    // return await this.endpointQueryService.getAtPersonListCount(
    //   endPoint.uuid,
    //   endPoint.type
    // )
  }
}

@Resolver(() => SmsEndPoint)
export class AlayunSmsEndPointResolver extends EndPointResolver {
  @ResolveField(() => SmsAK, { nullable: true })
  async accessKey(@Parent() endPoint: SmsEndPoint) {
    return await this.hybridKeySecretDataLoader.queryUesEndpointGetHybridKeySecret(endPoint.uuid)
  }
}
