import { Inject } from '@nestjs/common'
import { Args, Query, Parent, Resolver, ResolveField } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAction } from '@/common/model/action-query.model'
import { L3NetworkDataloader } from '@/network-resource/l3-network/l3-network.dataloader'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'

import { PortMirror, PortMirrorList } from './port-mirror.model'
import { PortMirrorService } from './port-mirror.service'

@Resolver(() => PortMirror)
export class PortMirrorResolver {
  @Inject() portMirrorService: PortMirrorService
  @Inject() l3NetworkDataloader: L3NetworkDataloader

  @Query(() => PortMirrorList)
  portMirrorList(@Args() queryArgs: QueryAction) {
    return this.portMirrorService.getPortMirrorList(queryArgs)
  }

  @ResolveField(() => L3Network)
  async flowNetwork(@Parent() { uuid, mirrorNetworkUuid }: PortMirror) {
    const params = {
      conditions: [
        { key: 'system', op: Op.eq, value: 'true' },
        { key: '__systemTag__', op: Op.eq, value: 'mirrorNetwork' }
      ]
    }
    return this.l3NetworkDataloader.query(uuid, mirrorNetworkUuid, params)
  }
}
