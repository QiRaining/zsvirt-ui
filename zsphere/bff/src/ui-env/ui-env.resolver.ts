import { Inject } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import { BootstrapDeployedInfo, UIEnvInfo } from './ui-env.model'
import { UIEnvService } from './ui-env.service'

@Resolver(UIEnvInfo)
export class UIEnvResolver {
  @Inject() uiEnvService: UIEnvService

  @Query(() => UIEnvInfo)
  async UIEnv() {
    return this.uiEnvService.getUIEnv()
  }

  @Query(() => BootstrapDeployedInfo)
  async isBootstrap() {
    return this.uiEnvService.isBootstrap()
  }
}
