import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import {
  MonitorTemplate,
  QueryMonitorTemplateResp
} from '@/maintenance/monitor-template/monitor-template.model'
import { MonitorTemplateService } from '@/maintenance/monitor-template/monitor-template.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'

@Resolver(() => MonitorTemplate)
export class MonitorTemplateResolver {
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() monitorTemplateService: MonitorTemplateService
  @Inject() tagDataloader: TagsDataloader

  @Query(() => QueryMonitorTemplateResp)
  async monitorTemplateList(@Args() queryArgs: QueryAction) {
    return this.monitorTemplateService.queryList(queryArgs)
  }

  @ResolveField('shareType', () => ShareType)
  async getShareType(@Parent() monitorTemplate: MonitorTemplate): Promise<ShareType> {
    return await this.ownerLoader.queryResourceShareType(monitorTemplate.uuid)
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() monitorTemplate: MonitorTemplate) {
    return this.tagDataloader.query(monitorTemplate.uuid)
  }

  @ResolveField(() => Int)
  async ruleTemplateNum(@Parent() monitorTemplate: MonitorTemplate) {
    return this.monitorTemplateService.queryRuleTemplateNum(monitorTemplate.uuid)
  }

  @ResolveField(() => Int)
  async monitorGroupNum(@Parent() monitorTemplate: MonitorTemplate) {
    return this.monitorTemplateService.queryMonitorGroupNum(monitorTemplate.uuid)
  }
}
