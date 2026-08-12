import { Module } from '@nestjs/common'

import { OwnerModule } from '@/zsphere-administration/owner/owner.module'
import { TagModule } from '@/zsphere-administration/tag/tag.module'

import { SshKeyPairQueryService } from './ssh-key-pair-query/ssh-key-pair-query.service'
import { SshKeyPairResolver } from './ssh-key-pair.resolver'

@Module({
  providers: [SshKeyPairResolver, SshKeyPairQueryService],
  imports: [TagModule, OwnerModule],
  exports: [SshKeyPairQueryService]
})
export class SshKeyPairModule {}
