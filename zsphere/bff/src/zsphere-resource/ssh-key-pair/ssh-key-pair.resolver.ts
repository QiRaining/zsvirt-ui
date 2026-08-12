import { Inject } from '@nestjs/common'
import { Query, Args, Resolver, ResolveField, Parent } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'
import { TagsDataloader } from '@/zsphere-administration/tag/tag.dataloader'
import { Tag } from '@/zsphere-administration/tag/tag.model'

import { SshKeyPairQueryService } from './ssh-key-pair-query/ssh-key-pair-query.service'
import {
  SshKeyPair,
  QuerySshKeyPairArgs,
  SshKeyPairList,
  SshKeyPairOwner
} from './ssh-key-pair.model'

@Resolver(() => SshKeyPair)
export class SshKeyPairResolver {
  @Inject() sshKeyPairQueryService: SshKeyPairQueryService
  @Inject() tagDataloader: TagsDataloader
  @Inject() ownerDataLoader: OwnerDataLoader

  @Query(() => SshKeyPairList)
  async sshKeyPairList(@Args() queryArgs: QuerySshKeyPairArgs) {
    return await this.sshKeyPairQueryService.queryList(queryArgs)
  }

  @Query(() => SshKeyPair, { nullable: true })
  async sshKeyPair(@Args('uuid') uuid: string) {
    const queryArgs = {
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: uuid
        }
      ]
    }

    const result = await this.sshKeyPairQueryService.queryList(queryArgs)

    return result?.list?.[0]
  }

  @ResolveField()
  async vmNum(@Parent() sshKeyPair: SshKeyPair) {
    return this.sshKeyPairQueryService.getVmNum(sshKeyPair.uuid)
  }

  @ResolveField(() => [Tag])
  async tag(@Parent() sshKeyPair: SshKeyPair) {
    return this.tagDataloader.query(sshKeyPair.uuid)
  }

  @ResolveField(() => SshKeyPairOwner)
  async owner(@Parent() sshKeyPair: SshKeyPair) {
    return this.ownerDataLoader.query(sshKeyPair.uuid)
  }
}
