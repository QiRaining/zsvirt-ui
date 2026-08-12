import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ZStackApiModule } from '@/api/zstack/zstack-api.module'
import { MetricDataService } from '@/common/metric-data/metric-data.service'
import { VmMetricDataLoader } from '@/common/metric-data/vm-metric-data-loader'
import { ZsEvent } from '@/model/zs-event.model'
import { ZsSession } from '@/model/zs-session.model'

import { MetricDataQueryService } from './metric-data-query/metric-data-query.service'
import { MetricDataResolver } from './metric-data.resolver'

@Global()
@Module({
  imports: [ZStackApiModule, SequelizeModule.forFeature([ZsEvent, ZsSession])],
  providers: [MetricDataService, VmMetricDataLoader, MetricDataResolver, MetricDataQueryService],
  exports: [MetricDataService]
})
export class MetricDataModule {}
