import { Inject } from '@nestjs/common'
import { Resolver, Query, Args } from '@nestjs/graphql'

import { BootstrapInfo, WizardInfo, EnvInfo, SdsInfo, GetSdsInfoArgs } from './cube.model'
import { CubeService } from './cube.service'
import { GetSdsInfoAction } from './GetSdsVersionAction'

@Resolver(() => EnvInfo)
export class CubeResolver {
  @Inject() cubeService: CubeService

  @Query(() => EnvInfo)
  async bootstrapEnv() {
    return this.cubeService.getEnv()
  }

  @Query(() => WizardInfo)
  async wizardInfo() {
    return this.cubeService.getWizardInfo()
  }
}

@Resolver(() => BootstrapInfo)
export class BootstrapResolver {
  @Inject() cubeService: CubeService

  @Query(() => BootstrapInfo)
  async bootstrapInfo() {
    return this.cubeService.getBootstrapInfo()
  }

  @Query(() => Boolean)
  async bootstrapServiceActive() {
    return this.cubeService.getBootstrapServiceStatus()
  }
}

@Resolver(() => SdsInfo)
export class SdsResolver {
  @Inject() getSdsInfoAction: GetSdsInfoAction

  @Query(() => SdsInfo)
  async sdsInfo(@Args() param: GetSdsInfoArgs) {
    try {
      return await this.getSdsInfoAction.call(param)
    } catch (error) {
      return {
        isExpandPoolSupported: false
      }
    }
  }
}
