import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import {
  ResourceStack,
  PreviewResult,
  QueryResourceStackResp,
  PreviewResourceStackArgs,
  QueryEventFromResourceStackResp,
  GetResourceFromResourceStackResp,
  CheckTemplateResp,
  CheckTemplateInput
} from '@/maintenance/resource-stack/resource-stack.model'
import { ResourceStackService } from '@/maintenance/resource-stack/resource-stack.service'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

@Resolver(() => ResourceStack)
export class ResourceStackResolver {
  @Inject() ownerLoader: OwnerDataLoader
  @Inject() ResourceStackService: ResourceStackService

  /**
   * 查询资源栈
   * @param queryArg
   */
  @Query(() => QueryResourceStackResp)
  async resourceStackList(@Args() queryArgs: QueryAction) {
    return this.ResourceStackService.queryList(queryArgs)
  }

  @ResolveField()
  async owner(@Parent() resourceStack: ResourceStack) {
    return this.ownerLoader.query(resourceStack.uuid)
  }

  /**
   * 创建时，预览资源栈
   * @param queryArg
   */
  @Query(() => PreviewResult)
  async previewResourceStack(@Args() queryArgs: PreviewResourceStackArgs) {
    return this.ResourceStackService.previewResourceStack(queryArgs)
  }

  /**
   * 查询资源栈内事件列表
   * @param queryArg
   */
  @Query(() => QueryEventFromResourceStackResp)
  async queryEventFromResourceStackList(@Args() queryArgs: QueryAction) {
    return this.ResourceStackService.queryEventFromResourceStackList(queryArgs)
  }

  /**
   * 获取资源栈内资源列表
   * @param queryArg
   */
  @Query(() => GetResourceFromResourceStackResp)
  async getResourceFromResourceStackList(@Args('uuid') uuid: string) {
    return this.ResourceStackService.getResourceFromResourceStackList(uuid)
  }

  /**
   * 校验模板参数
   * @param queryArgs
   */
  @Query(() => CheckTemplateResp)
  async checkTemplateParameters(@Args() queryArgs: CheckTemplateInput) {
    return this.ResourceStackService.CheckTemplate(queryArgs)
  }
}
