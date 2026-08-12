import { Module } from '@nestjs/common'

import { ZsvRoleActionModule } from './action/_module'
import { ZsvRoleQueryService } from './query/zsv-role-query.service'
import { ZsvRoleResolver } from './zsv-role.resolver'

@Module({
  imports: [ZsvRoleActionModule],
  providers: [ZsvRoleResolver, ZsvRoleQueryService],
  exports: [ZsvRoleResolver, ZsvRoleQueryService]
})
export class ZsvRoleModule {}
