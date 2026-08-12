import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import {
  GetMetricDataQueryType,
  MetricData,
  ZQLGetMetricDataListArgs as IZQLGetMetricDataListArgs
} from '../metric-data.model'

function isNetworkService(metricName: string) {
  return metricName.includes('ByServiceType')
}

function sortMetricDataByLabel(data: MetricData[]): MetricData[] {
  // 先按照 label 排序
  const sortedData = _.sortBy(data, 'label')

  // 对于 label 相同的数据，按照 time 排序
  const finalData = _.orderBy(sortedData, ['label', 'time'])

  return _.uniqBy(finalData, item => `${item.type}-${item.time}`)
}

const UDEV_WWID_PREFIX = /^(nvme|scsi|wwn|ata|usb|virtio|dm)-/i
const NVME_ID_PREFIX = /^(uuid|nguid|eui)\./i
const NVME_BY_ID_PREFIX = /^nvme-((?:uuid|nguid|eui)\..*)/i

export function escapeWwidForZWatchRegex(value: string) {
  return value.replace(/\./g, '[.]')
}

export function getWwid(label: string) {
  const parts = label.split(';').filter(Boolean)
  const nvmeIdent = parts.find(value => NVME_ID_PREFIX.test(value))
  if (nvmeIdent) {
    return nvmeIdent
  }

  const nvmeById = parts
    .map(value => value.match(NVME_BY_ID_PREFIX)?.[1])
    .find((value): value is string => !!value)
  if (nvmeById) {
    return nvmeById
  }

  return parts.find(value => !UDEV_WWID_PREFIX.test(value)) || label
}

function aggregateMultiPathData(data: any[]) {
  return _.chain(data)
    .groupBy(v => `${v.labels.HostUuid}-${getWwid(v.labels.Wwid)}-${v.time}`)
    .map(v => _.maxBy(v, 'value'))
    .value()
}

@Injectable()
export class MetricDataQueryService {
  @Inject() zqlService: ZQLService

  async queryList(args: IZQLGetMetricDataListArgs) {
    const { type, metricParams = [], conditions = [] } = args
    const zqlCondition = QueryConditionTranslator.translate(conditions)
    const zwatchList = []
    const metricList = []

    metricParams.forEach(param => {
      const { namespace, metricName, period, functions = [] } = param
      const labels: string[] = []
      let labelKey = ''
      let labelValues: string[] = []

      param.conditions.forEach(condition => {
        const { key, value, values } = condition
        if (value) {
          if (type === GetMetricDataQueryType.GetHostMultiPathMetric && key === 'Wwid') {
            labels.push(`${key}=~.*${escapeWwidForZWatchRegex(value)}.*`)
          } else {
            labels.push(`${key}=${value}`)
          }
        }
        // 多个监控对象
        if (values) {
          labelKey = key
          labelValues = values
          if (type === GetMetricDataQueryType.GetHostMultiPathMetric && key === 'Wwid') {
            labels.push(
              `${key}=~${values.map(v => `.*${escapeWwidForZWatchRegex(v)}.*`).join('|')}`
            )
          } else {
            labels.push(`${key}=~${values.join('|')}`)
          }
        }
      })

      if (
        [
          GetMetricDataQueryType.GetVmMetricDataByCluster,
          GetMetricDataQueryType.GetHostMetricDataByCluster
        ].includes(type) &&
        !isNetworkService(metricName)
      ) {
        functions.push('aggr(op="avg")')
      }

      if (isNetworkService(metricName)) {
        functions.push('aggr(op="sum")')
      }

      if (type === GetMetricDataQueryType.LoadBalancer) {
        functions.push('aggr(op="sum")')
      }

      const resultName = `zwatch-${metricName}`
      const startTime = Math.floor(param.startTime / 1000)
      const endTime = Math.floor(param.endTime / 1000)
      zwatchList.push({
        resultName,
        namespace,
        metricName,
        startTime,
        endTime,
        period,
        functions,
        labels
      })

      metricList.push({
        resultName,
        metricName,
        startTime,
        endTime,
        period,
        labelKey,
        labelValues
      })
    })

    let tableName = ''
    switch (type) {
      case GetMetricDataQueryType.VmInstance:
      case GetMetricDataQueryType.GetVmMetricDataByCluster:
      case GetMetricDataQueryType.VRouter:
        tableName = 'VmInstance'
        break
      case GetMetricDataQueryType.Host:
      case GetMetricDataQueryType.GetHostMultiPathMetric:
      case GetMetricDataQueryType.GetHostMetricDataByCluster:
        tableName = 'Host'
        break
      case GetMetricDataQueryType.PrimaryStorage:
        tableName = 'PrimaryStorage'
        break
      case GetMetricDataQueryType.BackupStorage:
        tableName = 'BackupStorage'
        break
      case GetMetricDataQueryType.BaremetalInstance:
        tableName = 'BaremetalInstance'
        break
      case GetMetricDataQueryType.BareMetal2Instance:
        tableName = 'BareMetal2Instance'
        break
      case GetMetricDataQueryType.L3Network:
        tableName = 'L3Network'
        break
      case GetMetricDataQueryType.VIP:
        tableName = 'VIP'
        break
      case GetMetricDataQueryType.EIP:
        tableName = 'EIP'
        break
      case GetMetricDataQueryType.LoadBalancer:
      case GetMetricDataQueryType.LoadBalancerListener:
        tableName = 'LoadBalancerListener'
        break
    }

    if (!tableName) {
      return []
    }

    return await this.query({
      type,
      tableName,
      zqlCondition,
      zwatchList,
      metricList
    })
  }

  async query({
    type,
    tableName,
    zqlCondition,
    zwatchList = [],
    metricList = []
  }: {
    type: GetMetricDataQueryType
    tableName: string
    zqlCondition: ZqlObject['condition']
    zwatchList: any[]
    metricList: any[]
  }) {
    const zqlObject = {
      tableName,
      fields: ['uuid'],
      condition: zqlCondition,
      returnWith: {
        zwatch: zwatchList,
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const returnList = _.get(results, ['0', 'returnWith'])

    const metricDataList: MetricData[] = []
    let hasLabel = false

    metricList.forEach(item => {
      const {
        resultName,
        metricName,
        startTime,
        endTime,
        period,
        labelKey,
        labelValues = []
      } = item

      let currentList = _.get(returnList, resultName, [])

      if (type === GetMetricDataQueryType.GetHostMultiPathMetric) {
        currentList = aggregateMultiPathData(currentList)
      }

      if (currentList.length === 0) {
        return
      }

      let currentTime = startTime

      while (currentTime <= endTime) {
        let found = false
        let foundCount = 0
        // 遍历zwatch结果
        for (const item of currentList) {
          // 先判断时间
          if (item.time === currentTime) {
            // 再区分是否有监控对象
            if (labelKey && !isNetworkService(metricName)) {
              hasLabel = true
              let currentLabel = _.get(item, `labels.${labelKey}`)
              if (type === GetMetricDataQueryType.GetHostMultiPathMetric && labelKey === 'Wwid') {
                currentLabel = getWwid(currentLabel)
              }
              const currentType = `${currentLabel}-${metricName}`
              labelValues.forEach((label: any) => {
                if (label === currentLabel) {
                  foundCount = foundCount + 1
                  metricDataList.push({
                    metricName,
                    time: currentTime * 1000,
                    value: item.value,
                    type: currentType,
                    label
                  })
                }
              })
              found = foundCount === labelValues.length
            } else {
              found = true
              metricDataList.push({
                metricName,
                time: currentTime * 1000,
                value: item.value,
                type: metricName
              })
            }
            if (found) {
              break
            }
          }
        }
        if (!found) {
          // 补零也同样要区分是否有对象
          if (labelKey && !isNetworkService(metricName)) {
            labelValues.forEach((label: any) => {
              const currentType = `${label}-${metricName}`
              metricDataList.push({
                metricName,
                time: currentTime * 1000,
                value: 0,
                type: currentType,
                label
              })
            })
          } else {
            metricDataList.push({
              metricName,
              time: currentTime * 1000,
              value: 0,
              type: metricName
            })
          }
        }
        currentTime = currentTime + period
      }
    })

    if (hasLabel) {
      const sortedMetricDataList = sortMetricDataByLabel(metricDataList)
      return sortedMetricDataList
    }

    return metricDataList
  }
}
