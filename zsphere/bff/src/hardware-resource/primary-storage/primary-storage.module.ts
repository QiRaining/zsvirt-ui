import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { CapacityCalculationQueryService } from '@/maintenance/capacity-calculation/query/capacity-calculation-query.service'
import { ResourceConfigModule } from '@/settings/resource-config/resource-config.module'
import { ResourceConfigService } from '@/settings/resource-config/resource-config.service'
import { ResourceAttributeModule } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.module'

import { ZsEvent } from '../../model/zs-event.model'
import { ZsSession } from '../../model/zs-session.model'
import { ZoneModule } from '../zone/zone.module'
import { PrimaryStorageActionModule } from './action/_module'
import { PrimaryStorageQueryService } from './primary-storage-query/primary-storage-query.service'
import { PrimaryStorageDataloader } from './primary-storage.dataloader'
import {
  ClusterAttachablePrimaryStorageTypesResolver,
  PrimaryStorageResolver,
  PrimaryStorageSummaryResolver
} from './primary-storage.resolver'
import { PrimaryStorageService } from './primary-storage.service'

@Module({
  imports: [
    SequelizeModule.forFeature([ZsEvent, ZsSession]),
    PrimaryStorageActionModule,
    ZoneModule,
    ResourceAttributeModule,
    ResourceConfigModule
  ],
  providers: [
    CapacityCalculationQueryService,
    PrimaryStorageService,
    PrimaryStorageResolver,
    ClusterAttachablePrimaryStorageTypesResolver,
    PrimaryStorageSummaryResolver,
    PrimaryStorageQueryService,
    PrimaryStorageDataloader,
    ResourceConfigService
  ],
  exports: [PrimaryStorageDataloader, PrimaryStorageQueryService]
})
export class PrimaryStorageModule {}
