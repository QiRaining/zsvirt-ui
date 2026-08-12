import { Inject } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  ResourceAttributeConstraint,
  ResourceAttributeConstraintResponse,
  ResourceAttributeKey,
  ResourceAttributeKeyResponse,
  ResourceAttributeValue,
  ResourceAttributeValueResponse,
  ResourceWithAttributes
} from './resource-attribute.model'
import { ResourceAttributeService } from './resource-attribute.service'

@Resolver(() => ResourceAttributeConstraint)
export class ResourceAttributeConstraintResolver {
  @Inject()
  private resourceAttributeService: ResourceAttributeService

  @Query(() => ResourceAttributeConstraintResponse)
  async queryResourceAttributeConstraintList(@Args() param: QueryAction) {
    return await this.resourceAttributeService.queryConstraintList(param)
  }

  @ResolveField()
  async resourceCount(@Parent() current: ResourceAttributeConstraint) {
    return await this.resourceAttributeService.getResourceCount(current)
  }
}

@Resolver(() => ResourceAttributeKey)
export class ResourceAttributeKeyResolver {
  @Inject()
  private resourceAttributeService: ResourceAttributeService

  @Query(() => ResourceAttributeKeyResponse)
  async queryResourceAttributeKeyList(@Args() param: QueryAction) {
    return await this.resourceAttributeService.queryKeyList(param)
  }
}

@Resolver(() => ResourceAttributeValue)
export class ResourceAttributeValueResolver {
  @Inject()
  private resourceAttributeService: ResourceAttributeService

  @Query(() => ResourceAttributeValueResponse)
  async queryResourceAttributeValueList(@Args() param: QueryAction) {
    return await this.resourceAttributeService.queryValueList(param)
  }

  @ResolveField()
  async resourceName(@Parent() current: ResourceAttributeValue) {
    return await this.resourceAttributeService.getResourceName(current.resourceUuid)
  }
}

@Resolver(() => ResourceWithAttributes)
export class ResourceAttributeFieldResolver {
  @Inject()
  private resourceAttributeService: ResourceAttributeService

  @ResolveField()
  async resourceAttributeValues(@Parent() current: any) {
    return await this.resourceAttributeService.getResourceAttributeValues(current.uuid)
  }
}
