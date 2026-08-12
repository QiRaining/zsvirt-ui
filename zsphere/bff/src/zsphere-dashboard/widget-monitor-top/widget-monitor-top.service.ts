import { Injectable, Inject } from '@nestjs/common'
import { find as _find } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { Cache, CacheService } from '@/common/cache'
import { SortDirectionValidValues } from '@/common/model/action-query.model'
import ZQL, { ZQLAction, ZOp } from '@/common/zql/index'

@Injectable()
export class WidgetMonitorTopService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  private cacheService: CacheService

  @Cache<any>({ ttl: 9 })
  async getTopList(
    namespace,
    metricName,
    limit,
    zoneUuid,
    hypervisorType = 'kvm',
    offsetAheadOfCurrentTime = 1
  ) {
    const operator = hypervisorType === 'kvm' ? ZOp.ne : ZOp.eq
    switch (namespace) {
      case 'ZStack/VM':
        return this._getZwatchTopList(
          namespace,
          metricName,
          limit,
          zoneUuid,
          'VmInstance',
          {
            type: 'UserVm',
            hypervisorType: {
              [operator]: 'ESX'
            }
          },
          'VMUuid',
          'zoneUuid',
          hypervisorType,
          offsetAheadOfCurrentTime
        )
      case 'vpc':
        return this._getZwatchTopList(
          'ZStack/VM',
          metricName,
          limit,
          zoneUuid,
          'VpcRouterVm',
          {
            hypervisorType: {
              [operator]: 'ESX'
            }
          },
          'VMUuid',
          undefined,
          undefined,
          offsetAheadOfCurrentTime
        )
      case 'ZStack/Host':
        return this._getZwatchTopList(
          namespace,
          metricName,
          limit,
          zoneUuid,
          'Host',
          {
            hypervisorType: {
              [operator]: 'ESX',
              [ZOp.notIn]: ['baremetal2']
            }
          },
          'HostUuid',
          'zoneUuid',
          hypervisorType,
          offsetAheadOfCurrentTime
        )
      case 'volume':
        return this._getDbTopList(
          metricName,
          limit,
          zoneUuid,
          'Volume',
          {
            type: 'Data',
            format: {
              [operator]: 'vmtx'
            }
          },
          'primaryStorage.zone.uuid'
        )
      case 'VolumeSnapshot':
        return this._getDbTopList(
          metricName,
          limit,
          zoneUuid,
          'VolumeSnapshot',
          {},
          'primaryStorage.zoneUuid'
        )
      case 'ZStack/L3Network':
        return this._getZwatchTopList(
          namespace,
          metricName,
          limit,
          zoneUuid,
          'L3Network',
          {
            'l2Network.cluster.type': {
              [operator]: 'vmware'
            }
          },
          'L3NetworkUuid'
        )
      case 'ZStack/VIP':
        return this._getZwatchTopList(
          namespace,
          metricName,
          limit,
          zoneUuid,
          'Vip',
          {},
          'VipUUID',
          'l3Network.zoneUuid'
        )
      default:
        return {
          list: [],
          valueMax: 0
        }
    }
  }

  /**
   * 通用查询 Zwatch 接口
   */
  _getZwatchTopList = async (
    namespace,
    metricName,
    limit,
    zoneUuid,
    tableName,
    defaultCondition,
    labelName,
    zoneKey = 'zoneUuid',
    hypervisorType = 'kvm',
    offsetAheadOfCurrentTime = 1
  ) => {
    const condition = !zoneUuid
      ? defaultCondition
      : {
          ...defaultCondition,
          [zoneKey]: zoneUuid
        }
    // if (hypervisorType === 'esx') condition.namespace = 'ZStack/VCenter'
    const functions = [`top(num=${limit})`]
    if (tableName === 'VmInstance') {
      functions.unshift('average(groupBy="VMUuid")')
    } else if (tableName === 'Host') {
      functions.unshift('average(groupBy="HostUuid")')
    }
    const zqlObject = {
      tableName: tableName,
      fields: ['uuid', 'name'],
      condition: condition,
      returnWith: {
        total: true,
        zwatch: [
          {
            namespace: hypervisorType === 'esx' ? 'ZStack/VCenter' : namespace,
            metricName,
            offsetAheadOfCurrentTime,
            period: offsetAheadOfCurrentTime / 100 < 10 ? 10 : offsetAheadOfCurrentTime / 100,
            functions: functions
          }
        ]
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    const {
      results: [
        {
          inventories: resp1 = [],
          returnWith: { zwatch: resp2 = [] }
        }
      ]
    } = resp

    return {
      list: resp2.map(e => {
        return {
          uuid: e.labels[labelName],
          name: _find(resp1, { uuid: e.labels[labelName] })?.name,
          value: e.value
        }
      }),
      valueMax: resp2.reduce((a, b) => Math.max(a, b.value), 0)
    }
  }

  /**
   * 通用查询 DB 接口
   */
  _getDbTopList = async (
    metricName,
    limit,
    zoneUuid,
    tableName,
    defaultCondition,
    zoneKey = 'zoneUuid'
  ) => {
    const condition = !zoneUuid
      ? defaultCondition
      : {
          ...defaultCondition,
          [zoneKey]: zoneUuid
        }
    const zqlObject = {
      tableName: tableName,
      fields: ['uuid', 'name', metricName],
      condition: condition,
      orderBy: metricName,
      orderDirection: 'desc' as SortDirectionValidValues,
      limit: limit
    }

    const zql = ZQL.stringify(zqlObject)
    const resp = await this.zqlService.call(zql)

    const {
      results: [{ inventories: resp1 = [] }]
    } = resp

    return {
      list: resp1.map(e => ({
        uuid: e.uuid,
        name: e.name,
        value: e[metricName]
      })),
      valueMax: resp1.reduce((a, b) => Math.max(a, b[metricName]), 0)
    }
  }
}
