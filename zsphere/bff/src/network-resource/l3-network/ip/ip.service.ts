import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { uniq, chunk as _chunk, remove as _remove } from 'lodash'

import { Condition as ICondition, Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  CheckIpAvailabilityAction,
  CheckIpAvailabilityActionParam
} from '@/api/zstack/CheckIpAvailabilityAction'
import { GetFreeIpOfIpRangeAction } from '@/api/zstack/GetFreeIpOfIpRangeAction'
import { GetFreeIpOfL3NetworkAction } from '@/api/zstack/GetFreeIpOfL3NetworkAction'
import { GetIpAddressCapacityAction } from '@/api/zstack/GetIpAddressCapacityAction'
import {
  GetL3NetworkIpStatisticAction,
  GetL3NetworkIpStatisticActionParam
} from '@/api/zstack/GetL3NetworkIpStatisticAction'
import { QueryAddressPoolAction } from '@/api/zstack/QueryAddressPoolAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

@Injectable()
export class IpService extends ActionService {
  @Inject() getIpAddressCapacityAction: GetIpAddressCapacityAction
  @Inject() getL3NetworkIpStatisticAction: GetL3NetworkIpStatisticAction
  @Inject() zqlService: ZQLService
  @Inject() getFreeIpOfL3NetworkAction: GetFreeIpOfL3NetworkAction
  @Inject() getFreeIpOfIpRangeAction: GetFreeIpOfIpRangeAction
  @Inject() checkIpAvailabilityAction: CheckIpAvailabilityAction
  @Inject() queryAddressPoolAction: QueryAddressPoolAction

  private ipCapacityLoader
  private usedIpCountLoader
  private ipCapacityForIpRangeLoader
  private ipRangeTypeLoader

  constructor() {
    super()
    this.ipCapacityLoader = new DataLoader(this._getIpCapacity)
    this.usedIpCountLoader = new DataLoader(this._getUsedIpCount)
    this.ipRangeTypeLoader = new DataLoader(this._getIpRangeTypeLoader)
    this.ipCapacityForIpRangeLoader = new DataLoader(this._getIpCapacityForIpRange)
  }

  async query(param: IQueryAction) {
    const finalConditions: ICondition[] = []
    let _extrazqlConditions

    const zqlCondition = this.buildZqlCondition(
      param.conditions.concat(finalConditions),
      _extrazqlConditions
    )
    const zqlObject = {
      tableName: 'IpRange',
      condition: zqlCondition,
      orderBy: param.sortBy,
      returnWith: {
        total: true
      },
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories = [], total }]
    } = await this.zqlService.call(zql)

    return {
      list: inventories,
      total: total
    }
  }

  async getIpRangeCount(l3NetworkUuid) {
    const genZqlObject = ipVersion => ({
      action: ZQLAction.COUNT,
      tableName: 'IpRange',
      condition: {
        l3NetworkUuid,
        ipVersion
      }
    })
    const ipv4zql = ZQL.stringify(genZqlObject(4))
    const ipv6zql = ZQL.stringify(genZqlObject(6))
    const ipv4Res = await this.zqlService.call(ipv4zql)
    const ipv6Res = await this.zqlService.call(ipv6zql)
    return {
      ipv4Num: ipv4Res?.results?.[0]?.total || 0,
      ipv6Num: ipv6Res?.results?.[0]?.total || 0
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []

    const extraConditions = _remove(conditions, condition =>
      ['shareType', 'ipRangeType'].includes(condition.key)
    )
    const conditionsMap = conditionsToObject(extraConditions) as {
      shareType?: string[]
      ipRangeType?: string[]
    }

    if (conditionsMap.shareType) {
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(conditionsMap.shareType, 'IpRangeVO')
      )
    }

    if (conditionsMap.ipRangeType && conditionsMap.ipRangeType.length === 1) {
      const thisOp = conditionsMap.ipRangeType[0] === 'AddressPool' ? ZOp.in : ZOp.notIn
      specicalCondition.push({
        uuid: {
          [thisOp]: {
            [ZOp.query]: {
              tableName: 'AddressPool.uuid'
            }
          }
        }
      })
    }

    const translateConditions = extrazqlConditions
      ? specicalCondition.concat(extrazqlConditions)
      : specicalCondition
    const zqlCondition = QueryConditionTranslator.translate(conditions, translateConditions)
    return zqlCondition
  }

  _getIpCapacity = async l3NetworkUuids => {
    // sortBy 保证结果的传入的uuidList 排序一致
    const { capacityData = [] } = await this.getIpAddressCapacityAction.call({
      l3NetworkUuids
    })

    return l3NetworkUuids.map(
      uuid =>
        (capacityData.find(cap => cap.resourceUuid === uuid) as any) || {
          totalCapacity: 0,
          availableCapacity: 0
        }
    )
  }

  async getIpCapacity(l3NetworkUuid) {
    return this.ipCapacityLoader.load(l3NetworkUuid)
  }

  _getUsedIpCount = async l3NetworkUuids => {
    const zql = ZQL.stringify({
      tableName: 'UsedIp',
      action: ZQLAction.COUNT,
      condition: {
        l3NetworkUuid: {
          [ZOp.in]: uniq(l3NetworkUuids)
        }
      },
      groupBy: 'l3NetworkUuid'
    })
    const res = await this.zqlService.call(zql)
    const list = res?.results?.[0]?.inventoryCounts
    const map = new Map(list.map(([item, cnt]) => [item.l3NetworkUuid, cnt]))
    return l3NetworkUuids.map(uuid => map.get(uuid) || 0)
  }

  async getUsedIpCount(l3NetworkUuid) {
    return await this.usedIpCountLoader.load(l3NetworkUuid)
  }

  _getIpRangeTypeLoader = async ipRangeUuids => {
    const { inventories } = await this.queryAddressPoolAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: ipRangeUuids
        }
      ]
    })
    return ipRangeUuids.map(uuid => {
      const ipRange = inventories.find(it => it?.uuid === uuid)
      return ipRange ? 'AddressPool' : 'Normal'
    })
  }

  getIpRangeType = ipRangeUuid => this.ipRangeTypeLoader.load(ipRangeUuid)

  _getIpCapacityForIpRange = async ipRangeUuids => {
    const { capacityData = [] } = await this.getIpAddressCapacityAction.call({
      ipRangeUuids
    })
    return ipRangeUuids.map(
      uuid =>
        (capacityData.find(cap => cap.resourceUuid === uuid) as any) || {
          totalCapacity: 0,
          availableCapacity: 0
        }
    )
  }

  async getIpCapacityForIpRange(ipRangeUuid) {
    return this.ipCapacityForIpRangeLoader.load(ipRangeUuid)
  }

  initGetIpList(getFn) {
    return async _param => {
      const resp = await getFn.call(_param)
      const ipList = resp.inventories.map(item => item.ip)
      return ipList.length > 5 ? _chunk(ipList, 5)[0] : ipList
    }
  }

  async getSwitchIpVersion({ ipVersion, getIpList, param }) {
    ipVersion = Number(ipVersion)
    let ipv4List = [],
      ipv6List = []
    switch (ipVersion) {
      case 46:
        param.ipVersion = 4
        ipv4List = await getIpList(param)
        param.ipVersion = 6
        ipv6List = await getIpList(param)
        break
      case 4:
        ipv4List = await getIpList(param)
        break
      case 6:
        ipv6List = await getIpList(param)
        break
      default:
        const ipList = await getIpList(param)
        ipList.some(ip => ip?.split('.')?.length === 4) ? (ipv4List = ipList) : (ipv6List = ipList)
        break
    }
    return { ipv4List, ipv6List }
  }

  async getFreeIpOfL3Network(l3NetworkUuid: string, ipVersion: 4 | 6 | 46) {
    const getIpList = this.initGetIpList(this.getFreeIpOfL3NetworkAction)
    const param = {
      l3NetworkUuid,
      ipRangeType: 'Normal',
      limit: 5
    } as any
    if (ipVersion) {
      param.ipVersion = ipVersion
    }
    return this.getSwitchIpVersion({ param, getIpList, ipVersion })
  }

  async getFreeIpOfIpRange(ipRangeUuid: string, ipVersion?: 4 | 6 | 46) {
    const getIpList = this.initGetIpList(this.getFreeIpOfIpRangeAction)
    const param = {
      ipRangeUuid,
      limit: 5
    } as any
    if (ipVersion) {
      param.ipVersion = ipVersion
    }
    return this.getSwitchIpVersion({ param, getIpList, ipVersion })
  }

  async getFreeIp(input) {
    const { ipRangeUuid, l3NetworkUuid, ipVersion } = input
    return l3NetworkUuid
      ? this.getFreeIpOfL3Network(l3NetworkUuid, ipVersion)
      : this.getFreeIpOfIpRange(ipRangeUuid, ipVersion)
  }

  async checkIpAvailability(input: CheckIpAvailabilityActionParam) {
    const res = await this.checkIpAvailabilityAction.call(input)
    return res?.available ? { available: true } : { available: false }
  }

  async getL3NetworkIpStatistic(param: IQueryAction) {
    const { conditions = [], ...resPrarm } = param
    const ipParams = []
    conditions.forEach(condition => {
      let _value = condition.value || condition.values
      switch (condition.key) {
        case 'ip':
          _value = `%${condition.value}%`
          ipParams.push(_value)
          return
        case 'ipVersion':
          if (condition.values?.length === 1) {
            if (condition.values[0] === 6) {
              ipParams.push('%:%')
            } else {
              ipParams.push('%.%')
            }
          }
          return
      }
      let _key = condition.key
      if (condition.key === 'resourceTypes') {
        _key = 'resourceType'
      }
      resPrarm[_key] = _value
    })

    const _param = {
      replyWithCount: true,
      ...resPrarm,
      sortBy: 'Ip'
    }

    if (ipParams.length) {
      ;(_param as GetL3NetworkIpStatisticActionParam).ip = ipParams.join("' and ip like '")
    }

    try {
      const { ipStatistics, total } = await this.getL3NetworkIpStatisticAction.call(
        _param as GetL3NetworkIpStatisticActionParam
      )
      return {
        list: ipStatistics,
        total
      }
    } catch (e) {
      return { error: e }
    }
  }
}
