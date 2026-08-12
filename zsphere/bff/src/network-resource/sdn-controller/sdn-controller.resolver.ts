import { Inject } from '@nestjs/common'
import { Args, Query, Mutation, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'

import {
  SdnController,
  SdnControllerList
  // AddSdnControllerInput
  // SdnControllerActionResp,
} from './sdn-controller.model'
import { SdnControllerService } from './sdn-controller.service'

@Resolver(() => SdnController)
export class SdnControllerResolver {
  @Inject() sdnControllerService: SdnControllerService

  /**
   * 查询列表
   * @param queryArgs QueryAction
   */
  @Query(() => SdnControllerList)
  sdnControllerList(@Args() queryArgs: QueryAction) {
    return this.sdnControllerService.sdnControllerList(queryArgs)
  }

  @ResolveField()
  async vdsUuid(@Parent() sdnController: SdnController) {
    return await this.sdnControllerService.getVdsUuid(sdnController.uuid)
  }

  /**
   * 更新信息
   * @param input UpdateSdnControllerInput
   */
  // @Mutation(() => SdnControllerActionResp)
  // async updateSdnController(
  //   @Args({ name: 'input', type: () => UpdateSdnControllerInput })
  //   input: UpdateSdnControllerInput
  // ): Promise<SdnControllerActionResp> {
  //   return (await this.sdnControllerService.update(input)) as Promise<
  //     SdnControllerActionResp
  //   >
  // }

  /**
   * 删除
   * @param uuids string[]
   */
  // @Mutation(() => SdnControllerActionResp)
  // async deleteSdnControllerList(
  //   @Args({ name: 'uuids', type: () => [String] })
  //   uuids: [string]
  // ): Promise<SdnControllerActionResp> {
  //   return (await this.sdnControllerService.deleteSdnControllerList(
  //     uuids
  //   )) as Promise<SdnControllerActionResp>
  // }

  /**
   * 创建
   * @param input AddSdnController
   */
  // @Mutation(() => ActionSendResp)
  // async addSdnController(
  //   @Args({ name: 'input', type: () => AddSdnControllerInput })
  //   input: AddSdnControllerInput
  // ): Promise<ActionSendResp> {
  //   return this.sdnControllerService.addSdnController(input)
  // }
}
