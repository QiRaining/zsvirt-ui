import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'

@Injectable()
export class VmMetricDataLoader {
  @Inject() getMetricDataAction: GetMetricDataAction

  private vmMetricDataLoader
  private metricMap: any = {}
  private metricName

  constructor() {
    this.vmMetricDataLoader = new DataLoader(this._query)
  }

  query(uuid, vmUuid, metricName) {
    this.metricName = metricName
    this.metricMap[uuid] = {
      uuid,
      vmUuid
    }
    return this.vmMetricDataLoader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const vmUuids = uuids.map(uuid => this.metricMap[uuid].vmUuid)
    const resp = await this.getMetricDataAction.call({
      namespace: 'ZStack/VM',
      metricName: this.metricName,
      offsetAheadOfCurrentTime: 1,
      labels: `VMUuid=~${vmUuids.join('|')}` as any //接口定义为数组，但是调用时应该传入字符串
    })

    const vmMetrics = resp.data
    return uuids.map(uuid => {
      const metric = vmMetrics.find(
        metric => metric?.labels?.VMUuid === this.metricMap[uuid].vmUuid
      )
      if (metric) {
        return metric
      } else {
        return null
      }
    })
  }
}
