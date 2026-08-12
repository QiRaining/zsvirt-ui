import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { Op, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QuerySNSEmailAddressAction } from '@/api/zstack/QuerySNSEmailAddressAction'
import { QuerySNSSmsEndpointAction } from '@/api/zstack/QuerySNSSmsEndpointAction'
import { QuerySNSTopicSubscriberAction } from '@/api/zstack/QuerySNSTopicSubscriberAction'
import { QueryVipAction } from '@/api/zstack/QueryVipAction'
import { EndPointType } from '@/common/enum'
import {
  QueryAction as IQueryAction,
  Condition as ICondition
} from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { OwnerDataLoader } from '@/zsphere-administration/owner/owner.dataloader'

@Injectable()
export class EndpointQueryService {
  @Inject() zqlService: ZQLService
  @Inject() queryVipAction: QueryVipAction
  @Inject() querySNSTopicSubscriberAction: QuerySNSTopicSubscriberAction
  @Inject() querySNSEmailAddressAction: QuerySNSEmailAddressAction
  @Inject() querySNSSmsEndpointAction: QuerySNSSmsEndpointAction
  @Inject() ownerDataLoader: OwnerDataLoader

  private topicDataLoader
  private atPersonListCountDataLoader
  private endpointMap: any = {}
  private atPersonListMap: { [key: string]: any } = {}

  constructor() {
    this.topicDataLoader = new DataLoader(this._getTopic)
    this.atPersonListCountDataLoader = new DataLoader(this._getAtPersonListCount)
  }

  async queryList(params: IQueryAction) {
    const { conditions, ...data } = params
    const _conditions = conditions.concat([
      {
        key: 'name',
        op: Op.ne,
        value: 'created-by-SystemHTTPTopicAndEndpointCreator'
      }
    ])
    return this.getEndpoint({
      ...data,
      conditions: _conditions
    })
  }

  async getEndpoint(param: IQueryAction) {
    const zqlCondition = await this.buildZqlCondition(param.conditions)
    const zqlObject = {
      tableName: 'SNSApplicationEndpoint',
      condition: zqlCondition,
      orderBy: param.sortBy,
      orderDirection: param.sortDirection,
      limit: param.limit,
      offset: param.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const endpoints = results?.[0]?.inventories ?? []
    // 加载topic字段
    const endpointUuids = endpoints?.map(endpoint => endpoint.uuid)
    const { inventories } = await this.querySNSTopicSubscriberAction.call({
      conditions: [
        {
          key: 'endpointUuid',
          op: Op.in,
          values: endpointUuids
        }
      ]
    })
    this.endpointMap = []
    inventories?.map(item => {
      if (endpointUuids.includes(item.endpointUuid)) {
        this.endpointMap[item.endpointUuid] = {
          uuid: item.endpointUuid,
          topicUuid: item.topicUuid
        }
      }
    })
    endpoints.map(endpoint => {
      if (this.endpointMap[endpoint.uuid]?.topicUuid) {
        endpoint.topic = this.getTopic(endpoint.uuid)
      }
      endpoint.owner = this.ownerDataLoader.query(endpoint.uuid)
    })
    // 总数
    const total = results?.[0]?.total ?? 0
    return {
      list: endpoints,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[]) {
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName'
    ])

    let zqlCondition = QueryConditionTranslator.translate(_conditions)
    const specialCondition = []

    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specialCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'SNSApplicationEndpointVO')
      )
    }

    const originAndCondition = zqlCondition[ZOp.and]
    if (specialCondition.length > 0 && originAndCondition) {
      zqlCondition = {
        [ZOp.and]: _.concat(originAndCondition, specialCondition)
      }
    }
    return zqlCondition
  }

  getTopic = async uuid => {
    return this.topicDataLoader.load(uuid)
  }

  _getTopic = async uuids => {
    const topicUuids = uuids.map(uuid => this.endpointMap[uuid]?.topicUuid)
    if (topicUuids) {
      const multZql = uuids.map(uuid => {
        return {
          tableName: 'SNSTopic',
          condition: {
            uuid: {
              [ZOp.in]: topicUuids
            }
          }
        }
      })
      const zql = ZQL.multStringify(multZql)
      const { results = [] } = await this.zqlService.call(zql)
      const topics = results?.[0]?.inventories
      return uuids.map(uuid => {
        const topic = topics?.find(topic => topic.uuid === this.endpointMap[uuid]?.topicUuid)
        if (topic) {
          return topic
        } else {
          return null
        }
      })
    } else {
      return null
    }
  }

  async queryEndpointEmailAddressList(params: IQueryAction) {
    const { inventories, total } = await this.querySNSEmailAddressAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async queryEndpointSmsAddressList(params: IQueryAction) {
    const { inventories, total } = await this.querySNSSmsEndpointAction.call(params)
    return {
      list: inventories?.[0]?.receivers,
      total
    }
  }

  async queryEndpointSNSSmsList(params: IQueryAction) {
    return this.querySNSSmsEndpointAction.call(params)
  }

  getAtPersonListCount = async (endPointUuid: string, endPointType: EndPointType) => {
    this.atPersonListMap[endPointUuid] = {
      endPointUuid,
      endPointType
    }

    return this.atPersonListCountDataLoader.load(endPointUuid)
  }

  _getAtPersonListCount = async (uuids: string[]) => {
    const endPointTypes: EndPointType[] = _.uniq(
      uuids.map(uuid => this.atPersonListMap[uuid]?.endPointType)
    )

    // 最多只有三条：wecom dingtalk feishu
    const multZql: ZqlObject[] = _.compact(endPointTypes).map(endPointType => {
      const zqlObject: ZqlObject = {
        action: ZQLAction.COUNT,
        condition: {
          endpointUuid: {
            [ZOp.in]: uuids
          }
        },
        groupBy: 'endpointUuid'
      }

      if (endPointType === EndPointType.DingTalk) {
        zqlObject.tableName = 'SNSDingTalkAtPerson'
      }
      if (endPointType === EndPointType.FeiShu) {
        zqlObject.tableName = 'SNSFeiShuAtPerson'
      }
      if (endPointType === EndPointType.WeCom) {
        zqlObject.tableName = 'SNSWeComAtPerson'
      }

      return zqlObject
    })

    const zql = ZQL.multStringify(multZql)

    const { results = [] } = await this.zqlService.call(zql)
    const endpointUuidMapCount: { [key: string]: number } = {}

    _.forEach(results, item => {
      const inventoryCounts = _.get(item, ['inventoryCounts'], [])
      const map = _.reduce(
        inventoryCounts,
        (result, current) => {
          const [it, total = 0] = current

          result[it?.endpointUuid] = total

          return result
        },
        {}
      )

      _.assign(endpointUuidMapCount, map)
    })

    return uuids.map(uuid => {
      return _.get(endpointUuidMapCount, [uuid])
    })
  }
}
