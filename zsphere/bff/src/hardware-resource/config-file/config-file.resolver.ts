import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { ConfigFileArgs, ConfigFileList } from './config-file.model'
import { ConfigFileService } from './config-file.service'

@Resolver()
export class ConfigFileResolver {
  @Inject() configFileService: ConfigFileService

  @Query(() => Boolean, {
    name: 'checkVmInstanceExists',
    description: '检查虚拟机 UUID 是否已存在'
  })
  async checkVmInstanceExists(@Args('vmInstanceUuid') vmInstanceUuid: string): Promise<boolean> {
    return this.configFileService.checkVmInstanceExists(vmInstanceUuid)
  }

  @Query(() => ConfigFileList, {
    name: 'configFileList',
    description: '扫描主存储上的配置文件列表'
  })
  async configFileList(@Args() args: ConfigFileArgs): Promise<ConfigFileList> {
    return this.configFileService.configFileList(args)
  }
}
