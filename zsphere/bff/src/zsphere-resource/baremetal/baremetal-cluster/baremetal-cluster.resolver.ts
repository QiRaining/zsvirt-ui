import { Resolver, Mutation, Args } from '@nestjs/graphql'

import { ActionResult } from '@/common/model/action.model'

import { CreateClusterService } from './action/create'
import { CreateBaremetalClusterInput } from './action/create'

@Resolver()
export class BaremetalClusterResolver {
  constructor(private readonly createClusterService: CreateClusterService) {}

  @Mutation(() => ActionResult)
  createBaremetalCluster(@Args('input') input: CreateBaremetalClusterInput) {
    return this.createClusterService.createBaremetalCluster(input)
  }
}
