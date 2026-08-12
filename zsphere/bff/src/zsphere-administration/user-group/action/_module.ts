import { Module } from '@nestjs/common'

import { AddUsersService } from './addUsers'
import { BindRolesService } from './bindRoles'
import { CreateUserGroupService } from './create'
import { DeleteUserGroupService } from './delete'
import { RemoveUsersService } from './removeUsers'
import { ShareResourcesService } from './shareResources'
import { UpdateUserGroupConfigService } from './updateUserGroupConfig'

@Module({
  imports: [],
  providers: [
    AddUsersService,
    RemoveUsersService,
    CreateUserGroupService,
    DeleteUserGroupService,
    UpdateUserGroupConfigService,
    BindRolesService,
    ShareResourcesService
  ],
  exports: []
})
export class UserGroupActionModule {}
