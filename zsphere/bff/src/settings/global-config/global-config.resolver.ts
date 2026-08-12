import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql'

import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

import { GlobalConfigQueryService } from './global-config-query/global-config-query.service'
import {
  GlobalConfigList,
  GlobalConfig,
  QueryGlobalConfigArgs,
  GlobalConfigCpuMode
} from './global-config.model'

@Resolver(() => GlobalConfig)
export class GlobalConfigResolver {
  @Inject() globalConfigQueryService: GlobalConfigQueryService
  @Inject() dataProtectionService: DataProtectionService

  @Query(() => GlobalConfig, { nullable: true })
  async globalConfig(@Args('category') category: string, @Args('name') name: string) {
    return await this.globalConfigQueryService.globalConfig(category, name)
  }

  @Query(() => GlobalConfig, { nullable: true })
  async getGlobalConfig(@Args('category') category: string, @Args('name') name: string) {
    return await this.globalConfigQueryService.getGlobalConfig(category, name)
  }

  @Query(() => GlobalConfigList)
  async globalConfigList(@Args() queryArgs: QueryGlobalConfigArgs) {
    return this.globalConfigQueryService.queryList(queryArgs)
  }

  @ResolveField(() => Boolean)
  async isValid(@Parent() globalConfig: GlobalConfig) {
    // 数据保护只保护平台策略中的全局设置
    const checkList = [
      `accessControl.enable.request.source.ip.address.check`,
      `identity.enable.unique.session`,
      `identity.session.timeout`,
      `loginControl.login.attempts.maximum`,
      `loginControl.login.control`,
      `passwordStrategy.enable.force.change.password.period`,
      `passwordStrategy.force.change.password.period`,
      `passwordStrategy.enable.historical.password.compare`,
      `passwordStrategy.historical.password.num`,
      `passwordStrategy.enable.lock.login.attempts.maximum`,
      `passwordStrategy.password.strength.check.config`,
      `twofa.twofa.enable`
    ]
    return checkList?.indexOf(`${globalConfig?.category}.${globalConfig?.name}`) > -1
      ? await this.dataProtectionService.checkDataIntegrity(globalConfig.id, 'GlobalConfigVO')
      : true
  }

  @ResolveField()
  async uuid(@Parent() globalConfig: GlobalConfig) {
    return `${globalConfig.category}.${globalConfig.name}`
  }
  @Query(() => GlobalConfigCpuMode)
  async queryGlobalConfigCpuMode() {
    return await this.globalConfigQueryService.queryGlobalConfigCpuMode()
  }
}
