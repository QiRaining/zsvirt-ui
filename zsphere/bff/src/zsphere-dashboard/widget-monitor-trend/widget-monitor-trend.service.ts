import { Injectable, Inject } from '@nestjs/common'
import {
  find as _find,
  groupBy as _groupBy,
  map as _map,
  sumBy as _sumBy,
  forEach as _forEach
} from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { Cache, CacheService } from '@/common/cache'
import { formatMetricValueList } from '@/common/metric-data/utils'
import ZQL, { ZQLAction, ZOp } from '@/common/zql/index'

@Injectable()
export class WidgetMonitorTrendService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  private cacheService: CacheService

  @Cache<any>({ ttl: 9 })
  async getMonitorTrend(
    namespace,
    metricNameList,
    offset,
    calculateType,
    zoneUuid,
    hypervisorType = 'kvm',
    metricConditions
  ) {
    switch (namespace) {
      case 'ZStack/Host':
        return this._getMultiZwatchTrendList(
          metricNameList,
          offset,
          calculateType,
          zoneUuid,
          hypervisorType,
          'host',
          {
            hypervisorType: {
              [ZOp.notIn]: ['baremetal2']
            }
          },
          undefined,
          metricConditions
        )
      case 'ZStack/PrimaryStorage':
        return this._getMultiZwatchTrendList(
          metricNameList,
          offset,
          calculateType,
          zoneUuid,
          hypervisorType,
          'primaryStorage',
          {
            type: {
              [ZOp.ne]: 'VCenter'
            }
          },
          undefined,
          []
        )
      case 'ZStack/BackupStorage':
        return this._getMultiZwatchTrendList(
          metricNameList,
          offset,
          calculateType,
          zoneUuid,
          hypervisorType,
          'backupStorage',
          {},
          'zone.uuid',
          []
        )
      default:
        return {
          list: [],
          currentValue: [0]
        }
    }
  }

  _getMultiZwatchTrendList = async (
    metricNameList,
    offset = 300,
    calculateType = 'average',
    zoneUuid,
    hypervisorType = 'kvm',
    tableName,
    defaultCondition,
    zoneKey = 'zoneUuid',
    metricConditions = []
  ) => {
    const res = {
      list: [],
      currentValue: []
    }
    for (let index = 0; index < metricNameList.length; index++) {
      const resultItem = await this._getZwatchTrendList(
        metricNameList[index],
        offset,
        calculateType,
        hypervisorType,
        zoneUuid,
        tableName,
        defaultCondition,
        zoneKey,
        metricConditions
      )
      res.list = res.list.concat(resultItem.list)
      res.currentValue.push(resultItem.currentValue)
    }

    return res
  }

  _getZwatchTrendList = async (
    metricName,
    offset = 300,
    calculateType = 'average',
    hypervisorType = 'kvm',
    zoneUuid,
    tableName,
    defaultCondition,
    zoneKey = 'zoneUuid',
    metricConditions
  ) => {
    const condition = !zoneUuid
      ? defaultCondition
      : {
          ...defaultCondition,
          [zoneKey]: zoneUuid
        }
    const endTime = Math.round(new Date().getTime() / 1000)
    const startTime = endTime - offset
    const baseZwatchCondition = {
      metricName,
      endTime,
      startTime,
      period: offset / 60
    }

    const labels = []

    _forEach(metricConditions, metricCondition => {
      const { key, value, values } = metricCondition

      if (value) {
        labels.push(`${key}=${condition.value}`)
      }

      if (values) {
        labels.push(`${key}=~${values.join('|')}`)
      }
    })

    const zqlObject = {
      tableName: tableName,
      fields: ['uuid'],
      condition: condition,
      returnWith: {
        zwatch: [
          hypervisorType === 'kvm'
            ? {
                ...baseZwatchCondition,
                labels
              }
            : { namespace: 'ZStack/VCenter', ...baseZwatchCondition }
        ]
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    const {
      results: [
        {
          returnWith: { zwatch: resp1 = [] }
        }
      ]
    } = resp

    let list = _map(_groupBy(resp1, 'time'), (e, i) => ({
      time: i,
      value: this.calculateValue(calculateType, e),
      type: metricName
    }))

    list =
      list.length > 0
        ? formatMetricValueList({
            startTime,
            endTime,
            period: offset / 60,
            metricName,
            dataList: list,
            fill: null
          })
        : list
    return {
      list,
      currentValue: list.length ? list[list.length - 1].value : 0
    }
  }

  calculateValue = (type, e) => {
    switch (type) {
      case 'average':
        return _sumBy(e, 'value') / e.length
      case 'sum':
        return _sumBy(e, 'value')
      default:
        return _sumBy(e, 'value') / e.length
    }
  }
}
