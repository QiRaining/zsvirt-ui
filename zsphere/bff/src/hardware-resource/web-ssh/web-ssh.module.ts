import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { WebSshActionModule } from './action/_module'
import { WebSSHResolver } from './web-ssh.resolver'
import { WebSSHService } from './web-ssh.service'

@Module({
  imports: [SequelizeModule.forFeature([ZsEvent, ZsSession]), WebSshActionModule],
  providers: [WebSSHResolver, WebSSHService]
})
export class WebSSHModule {}
