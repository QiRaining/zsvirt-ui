import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { FlowModule } from '@/common/flow/flow.module'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'

import { CertResolver } from './cert-manage.resolver'
import { CertManageService } from './cert-manage.service'
import { Config } from './utils/config'
import { Nginx } from './utils/nginx'

@Module({
  imports: [
    ConfigModule,
    ZStackApiModule,
    FlowModule,
    HttpModule,
    SequelizeModule.forFeature([ZsEvent, ZsSession])
  ],
  providers: [CertManageService, CertResolver, ManagementNodeService, Config, Nginx]
})
export class CertManageModule {}
