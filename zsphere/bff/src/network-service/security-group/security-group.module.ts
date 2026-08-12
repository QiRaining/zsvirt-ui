import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

import { SecurityGroupActionModule } from './action/_module'
import { SecurityGroupDataloader } from './security-group.dataloader'
import { SecurityGroupResolver, SecurityGroupRuleResolver } from './security-group.resolver'
import { SecurityGroupService } from './security-group.service'

@Module({
  imports: [
    ZStackApiModule,
    FlowModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    SecurityGroupActionModule
  ],
  providers: [
    SecurityGroupService,
    SecurityGroupResolver,
    SecurityGroupRuleResolver,
    SecurityGroupDataloader,
    OwnerDataLoader
  ],
  exports: [SecurityGroupDataloader]
})
export class SecurityGroupModule {}
