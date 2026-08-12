import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { TransModule } from '@/common/trans/trans.module'
import { ZsRolePrivilege } from '@/model/zs-role-privilege.model'

import { PrivilegeService } from './privilege.service'

@Global()
@Module({
  imports: [TransModule, SequelizeModule.forFeature([ZsRolePrivilege])],
  providers: [PrivilegeService],
  exports: [PrivilegeService]
})
export class PrivilegeModule {}
