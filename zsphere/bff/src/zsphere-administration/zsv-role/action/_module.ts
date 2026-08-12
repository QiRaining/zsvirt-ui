import { Module } from '@nestjs/common'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'

import { CloneRoleService } from './cloneRole'
import { CreateRoleService } from './create'
import { DeleteRoleService } from './delete'
import { UpdateRoleApiConfigService } from './updateRoleApiConfig'
import { UpdateRoleConfigService } from './updateRoleConfig'

@Module({
  imports: [],
  providers: [
    CloneRoleService,
    CreateRoleService,
    DeleteRoleService,
    UpdateRoleConfigService,
    UpdateRoleApiConfigService,
    ZStackApiBase
  ],
  exports: []
})
export class ZsvRoleActionModule {}
