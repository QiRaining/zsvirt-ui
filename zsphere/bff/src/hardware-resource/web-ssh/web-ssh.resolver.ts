import { Inject } from '@nestjs/common'
import { Query, Resolver } from '@nestjs/graphql'

import { WebSSHService } from '@/hardware-resource/web-ssh/web-ssh.service'

import { WebSSH } from './web-ssh.model'

@Resolver(() => WebSSH)
export class WebSSHResolver {
  @Inject() webSSHService: WebSSHService

  @Query(() => WebSSH)
  async webSSHUrl() {
    return this.webSSHService.queryWebSSHUrl()
  }
}
