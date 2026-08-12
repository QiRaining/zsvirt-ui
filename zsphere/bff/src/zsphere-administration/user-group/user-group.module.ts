import { Module } from '@nestjs/common'

import { UserGroupActionModule } from './action/_module'
import { UserGroupQueryService } from './query/user-group-query.service'
import { UserGroupResolver } from './user-group.resolver'

@Module({
  imports: [UserGroupActionModule],
  providers: [UserGroupResolver, UserGroupQueryService],
  exports: [UserGroupResolver, UserGroupQueryService]
})
export class UserGroupModule {}
