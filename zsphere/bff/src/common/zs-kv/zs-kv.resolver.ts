import { Inject } from '@nestjs/common'
import { Args, Field, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql'

import { ZsKvService } from './zs-kv.service'

@ObjectType()
export class ZsKvResult {
  @Field(() => String)
  key: string

  @Field(() => String)
  value: string
}

@Resolver(() => ZsKvResult)
export class ZsKvResolver {
  @Inject() zsKvService: ZsKvService

  @Query(() => ZsKvResult, { nullable: true })
  async zsKv(@Args('key') key: string) {
    return this.zsKvService.query(key)
  }

  @Mutation(() => ZsKvResult, { nullable: true })
  async updateZsKv(@Args('key') key: string, @Args('value') value: string) {
    return this.zsKvService.update(key, value)
  }
}
