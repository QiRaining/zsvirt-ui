import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZsUIConfig } from '@/model/zs-ui-config.model'

import { GlobalConfigActionModule } from './action/_module'
import { GlobalConfigQueryService } from './global-config-query/global-config-query.service'
import { GlobalConfigDataloader } from './global-config.dataloader'
import { GlobalConfigResolver } from './global-config.resolver'

@Module({
  imports: [GlobalConfigActionModule, SequelizeModule.forFeature([ZsUIConfig])],
  providers: [GlobalConfigQueryService, GlobalConfigResolver, GlobalConfigDataloader],
  exports: [GlobalConfigDataloader]
})
export class GlobalConfigModule {}
