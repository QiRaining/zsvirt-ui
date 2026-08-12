import { Injectable } from '@nestjs/common'

import { MetricDataloaderFactory } from '@/common/metric-data/metric-data.loader'

@Injectable()
export class PhysicalMetricDataLoader extends MetricDataloaderFactory({
  namespace: 'ZStack/Host',
  metricName: 'PhysicalNetworkInterface'
}) {}
