import { Inject } from '@nestjs/common'
import DataLoader from 'dataloader'

import { GetMetricDataAction } from '@/api/zstack/GetMetricDataAction'

interface IProps {
  metricName: string
  namespace: string
  offsetAheadOfCurrentTime?: number
  result?: string
}

type Option = {
  key: string
  value: string
  type: 'single' | 'mutiple'
}

export const MetricDataloaderFactory = ({
  namespace,
  metricName,
  offsetAheadOfCurrentTime = 1
}: IProps) => {
  class MetricDataLodaer {
    @Inject() getMetricDataAction: GetMetricDataAction
    labelsMap: {
      [key: string]: string[]
    } = {}
    uuidMap: {
      [uuid: string]: (metric: any) => boolean
    } = {}
    loader
    constructor() {
      this.loader = new DataLoader(this._query)
    }

    setOption = ({ key, value, type }: Option) => {
      if (type === 'single' && !this.labelsMap[key]) {
        this.labelsMap[key] = [value]
      }
      if (type === 'mutiple') {
        if (this.labelsMap[key]) {
          if (!this.labelsMap[key].includes(value)) {
            this.labelsMap[key].push(value)
          }
        } else {
          this.labelsMap[key] = [value]
        }
      }
    }

    query(uuid, findBy) {
      this.uuidMap[uuid] = findBy
      return this.loader.load(uuid)
    }

    _query = async (uuids: string[]) => {
      const labels = Object.keys(this.labelsMap).map(
        key => `${key}=~${this.labelsMap[key].join('|')}`
      )
      const resp = await this.getMetricDataAction.call({
        namespace,
        metricName,
        offsetAheadOfCurrentTime,
        labels
      })

      const metricList = resp.data
      return uuids.map(uuid => {
        const findBy = this.uuidMap[uuid]
        const metric = metricList.find(findBy)
        // const findBy = metric => metric?.labels?.VMUuid === uuid
        if (metric) {
          return metric
        } else {
          return null
        }
      })
    }
  }
  return MetricDataLodaer as new () => any
}
