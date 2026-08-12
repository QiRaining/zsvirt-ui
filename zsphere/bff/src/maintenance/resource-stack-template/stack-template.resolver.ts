import { Inject } from '@nestjs/common'
import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import {
  QueryStackTemplateResp,
  StackTemplate,
  QueryStackTemplateArgs
} from './stack-template.model'
import { StackTemplateService } from './stack-template.service'

@Resolver(() => StackTemplate)
export class StackTemplateResolver {
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() stackTemplateService: StackTemplateService

  @Query(() => QueryStackTemplateResp)
  async stackTemplateList(@Args() params: QueryStackTemplateArgs): Promise<QueryStackTemplateResp> {
    return this.stackTemplateService.query(params)
  }
  @ResolveField()
  async owner(@Parent() stackTemplate: StackTemplate) {
    return this.ownerLoader.query(stackTemplate.uuid)
  }
  @ResolveField()
  async isSystemTemplate(@Parent() stackTemplate: StackTemplate) {
    return this.stackTemplateService.checkIsSystemTemplate(stackTemplate.uuid)
  }
  @ResolveField('shareType', () => ShareType)
  async shareType(@Parent() stackTemplate: StackTemplate): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(stackTemplate.uuid)
  }
}
