import { Module, Global } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsSession } from '../../../model/zs-session.model'
import { DataProtectionService } from './data-protection.service'

@Global()
@Module({
  imports: [SequelizeModule.forFeature([ZsSession])],
  providers: [DataProtectionService],
  exports: [DataProtectionService]
})
export class CloudDataProtectionModule {}
