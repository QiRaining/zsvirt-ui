import { Module } from '@nestjs/common'

import { UIPrivilegeResolver } from './ui-privilege.resolver'
import { UIPrivilegeService } from './ui-privilege.service'

@Module({
  providers: [UIPrivilegeResolver, UIPrivilegeService],
  exports: [UIPrivilegeService]
})
export class UIPrivilegeModule {}
