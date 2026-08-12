import { Module } from '@nestjs/common'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'

import { CreateBaremetalInstanceService } from './create'
import { DeleteBaremetalInstanceService } from './delete'
import { ExpungeBaremetalInstanceService } from './expunge'
import { OpenBaremetalInstanceConsoleService } from './open-console'
import { RebootBaremetalInstanceService } from './reboot'
import { RecoverBaremetalInstanceService } from './recover'
import { StartBaremetalInstanceService } from './start'
import { StopBaremetalInstanceService } from './stop'
import { UpdateBaremetalInstanceService } from './update'

@Module({
  imports: [],
  providers: [
    ZStackApiBase,
    StartBaremetalInstanceService,
    StopBaremetalInstanceService,
    RebootBaremetalInstanceService,
    RecoverBaremetalInstanceService,
    ExpungeBaremetalInstanceService,
    DeleteBaremetalInstanceService,
    UpdateBaremetalInstanceService,
    OpenBaremetalInstanceConsoleService,
    CreateBaremetalInstanceService
  ],
  exports: []
})
export class BaremetalInstanceActionModule {}
