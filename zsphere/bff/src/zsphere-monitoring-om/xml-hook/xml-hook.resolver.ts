import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import { XmlHook, XMLHookList } from './xml-hook.model'
import { XmlHookService } from './xml-hook.service'

@Resolver(() => XmlHook)
export class XmlHookResolver {
  @Inject() xmlHookService: XmlHookService

  @Query(() => XMLHookList)
  async xmlHookList(@Args() queryArgs: QueryAction) {
    return this.xmlHookService.queryList(queryArgs)
  }
}
