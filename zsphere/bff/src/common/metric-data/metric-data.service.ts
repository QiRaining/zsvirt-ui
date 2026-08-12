import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { Condition as ICondition } from '@/api/zstack/base/query-base'
import {
  GetMetricDataAction,
  GetMetricDataActionParam as IGetMetricDataActionParam
} from '@/api/zstack/GetMetricDataAction'
import {
  GetMetricLabelValueAction,
  GetMetricLabelValueActionParam as IGetMetricLabelValueActionParam
} from '@/api/zstack/GetMetricLabelValueAction'
import { GetPrometheusMetricLabelValueAction } from '@/api/zstack/GetPrometheusMetricLabelValueAction'
import { ActionService } from '@/base/action-service'

import { MetricData } from './metric-data.model'

const CHUNK_SIZE = 20

@Injectable()
export class MetricDataService extends ActionService {
  @Inject() getMetricDataAction: GetMetricDataAction
  @Inject() getMetricLabelValueAction: GetMetricLabelValueAction
  @Inject()
  getPrometheusMetricLabelValueAction: GetPrometheusMetricLabelValueAction

  async getMetricData(
    namespace: string,
    startTime: number,
    endTime: number,
    period: number,
    metricName: string,
    conditions?: ICondition[],
    config?: {
      fillZero?: boolean
    }
  ) {
    let dataList = []
    let hasMultiType = false
    let multiTypeKey = ''
    let multiTypeValues = []
    const batchResource = {}
    const labels = []
    // 是否多个监控对象
    conditions?.forEach(item => {
      const { key, value, values } = item
      if (value) {
        labels.push(`${item.key}=${item.value}`)
      }
      if (values) {
        hasMultiType = true
        multiTypeKey = key
        multiTypeValues = values
        if (values?.length > CHUNK_SIZE) {
          _.set(batchResource, key, _.chunk(values, CHUNK_SIZE))
        } else {
          labels.push(`${key}=~${values.join('|')}`)
        }
      }
    })
    // 后端取的时间戳是去掉末3位的
    startTime = Math.floor(startTime / 1000)
    endTime = Math.floor(endTime / 1000)

    if (!_.isEmpty(batchResource)) {
      const param: IGetMetricDataActionParam = {
        namespace,
        startTime,
        endTime,
        period,
        metricName
      }

      const tasks = []

      _.forEach(_.keys(batchResource), key => {
        _.forEach(_.get(batchResource, key, []), _values => {
          const _labels = [`${key}=~${_values.join('|')}`]
          param.labels = _.concat(labels, _labels)
          tasks.push(
            this.getMetricDataAction.call(param).then(res => {
              dataList = _.concat(dataList, _.get(res, 'data', []))
            })
          )
        })
      })

      try {
        await Promise.all(tasks)
      } catch (error) {
        console.error(error)
      }
    } else {
      const param: IGetMetricDataActionParam = {
        namespace,
        startTime,
        endTime,
        period,
        metricName,
        labels
      }
      try {
        const res = await this.getMetricDataAction.call(param)
        dataList = res?.data ?? []
      } catch (error) {
        console.error(error)
      }
    }

    // console.log('请求返回的数据量: ' + dataList.length)
    // const processStartTime = new Date()

    const resultMap = new Map<string, MetricData>()
    let result: MetricData[] = dataList.reduce((pre, cur) => {
      const curTime = cur.time * 1000
      // 数字取到小数后面2位
      const curValue = cur.value ? Number(cur.value.toFixed(2)) : 0
      const curType = hasMultiType ? cur.labels[multiTypeKey] : metricName
      const item: MetricData = {
        metricName,
        time: curTime,
        value: curValue,
        type: curType
      }
      // 把每条数据存入map，时间戳加监控项作为唯一key，用于找到缺省的数据
      resultMap.set(`${curTime}-${curType}`, item)
      pre.push(item)
      return pre
    }, [])

    const { fillZero = true } = config ?? {}
    if (!fillZero) {
      return result
    }

    const expectResultCount = hasMultiType
      ? multiTypeValues.length * Math.floor((endTime - startTime) / period)
      : Math.floor((endTime - startTime) / period)
    // 如果返回的数据量不符合期望，则需要补缺
    if (result.length <= expectResultCount) {
      // 按时间累加轮询
      for (let time = startTime; time <= endTime; time = time + period) {
        const curTime = time * 1000
        if (hasMultiType) {
          // 按时间加监控项从map查找数据是否存在
          multiTypeValues.forEach(curType => {
            if (!resultMap.get(`${curTime}-${curType}`)) {
              // console.log('缺少数据: ' + `${curTime}-${curType}`)
              result.push({
                metricName,
                time: curTime,
                value: 0,
                type: curType
              })
            }
          })
        } else {
          const curType = metricName
          if (!resultMap.get(`${curTime}-${curType}`)) {
            // console.log('缺少数据: ' + `${curTime}-${curType}`)
            result.push({
              metricName,
              time: curTime,
              value: 0,
              type: curType
            })
          }
        }
        if (result.length >= expectResultCount) {
          break
        }
      }
    }

    if (hasMultiType) {
      // 多监控对象的时候，后端返回的数据是乱序的，需要按照传入的监控对象的顺序重新排序
      result = _.sortBy(result, [item => multiTypeValues.indexOf(item.type)])
    }
    // const processEndTime = new Date()
    // const duration = processEndTime.getTime() - processStartTime.getTime()
    // console.log('总耗时：' + duration)
    return result
  }

  async getMetricDataList(
    namespace: string,
    startTime: number,
    endTime: number,
    period: number,
    metricList: {
      metricName: string
      conditions?: ICondition[]
    }[]
  ) {
    const callList = metricList.map(({ metricName, conditions }) => {
      return this.getMetricData(namespace, startTime, endTime, period, metricName, conditions)
    })
    return await Promise.all(callList)
  }

  async getMetricLabelValue(
    namespace: string,
    metricName: string,
    labelName: string,
    filterLabels?: string,
    startTime?: number,
    endTime?: number
  ) {
    const labelNames = labelName.split(',')
    const param: IGetMetricLabelValueActionParam = {
      namespace,
      metricName,
      labelNames,
      filterLabels: filterLabels ? filterLabels.split(',') : []
    }
    if (startTime) {
      param.startTime = Math.floor(startTime / 1000)
    }
    if (endTime) {
      param.endTime = Math.floor(endTime / 1000)
    }
    let result = []
    try {
      // getPrometheusMetricLabelValueAction 接口无法多 labelName 分组，所以做一个限定
      // getMetricLabelValueAction 接口在某些场景下，获取不全
      if (labelNames?.length === 1) {
        const res = await this.getPrometheusMetricLabelValueAction.call(param)
        const {
          labelValues: { [labelName]: labels = [] }
        } = res ?? {}
        result = labels.map(item => {
          return { value: item }
        })
      } else {
        // 需要使用GetMetricLabelValueAction
        const res = await this.getMetricLabelValueAction.call(param)
        const { labels = [] } = res ?? {}
        if (labelNames.length > 1) {
          result = [
            {
              value: JSON.stringify(labels)
            }
          ]
        } else {
          result = labels
            .filter(item => item.hasOwnProperty(labelName))
            .map(item => {
              return { value: item[labelName] }
            })
        }
      }
    } catch (error) {
      console.log(error)
    }
    return result ?? []
  }
}
