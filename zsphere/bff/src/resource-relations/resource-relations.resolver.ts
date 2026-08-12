import { Inject } from '@nestjs/common'
import { Args, Resolver, Query } from '@nestjs/graphql'

import {
  ResourceRelationsResp,
  ResourceRelationsArgs,
  ResourceNode
} from './resource-relations.model'
import { ResoruceRelationsService } from './resource-relations.service'

@Resolver(() => ResourceNode)
export class ResourceRelationsResolver {
  @Inject() service: ResoruceRelationsService

  @Query(() => ResourceRelationsResp)
  async resourceRelations(@Args() queryArgs: ResourceRelationsArgs) {
    const { l2NetworkUuid } = queryArgs
    if (l2NetworkUuid) {
      return await this.service.getRelationsByL2(l2NetworkUuid)
    }
    return {
      nodes: []
    }
  }
}
