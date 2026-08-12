import { Inject, Injectable } from '@nestjs/common'

import { Condition as ICondition, Op, conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryBaremetalPxeServerAction } from '@/api/zstack/QueryBaremetalPxeServerAction'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, QueryConditionTranslator } from '@/common/zql/index'

import {
  BaremetalPxeServerQueryResp,
  QueryClusterArgs,
  BaremetalPxeServerQueryType
} from '../baremetal-pxe-server.model'

@Injectable()
export class QueryBaremetalPxeServerService {
  @Inject() zqlService: ZQLService
  @Inject()
  queryBaremetalPxeServerAction: QueryBaremetalPxeServerAction

  async query(params: QueryClusterArgs): Promise<BaremetalPxeServerQueryResp> {
    const { type = BaremetalPxeServerQueryType.Normal } = params
    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case BaremetalPxeServerQueryType.Normal:
        break

      // 获取裸金属集群可加载的部署服务器
      case BaremetalPxeServerQueryType.ClusterAttachablePxeServer:
        _extrazqlConditions = await this.getClusterAttachablePxeServer(params.extraConditions)
        break

      default:
        break
    }
    const zqlCondition = QueryConditionTranslator.translate(params.conditions, _extrazqlConditions)
    _resultResp = await this.getBaremetalPxeServerList(params, zqlCondition)

    return _resultResp
  }

  async getBaremetalPxeServerList(param: QueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'BaremetalPxeServer',
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
    const volumes = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: volumes,
      total: total
    }
  }
  async getClusterAttachablePxeServer(extraConditions: ICondition[]) {
    const conditionsMap = conditionsToObject(extraConditions)
    const zqlObject = {
      tableName: 'BaremetalPxeServer',
      fields: ['uuid'],
      condition: {
        state: 'Enabled',
        status: 'Connected',
        [ZOp.and]: {
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'BaremetalPxeServer',
                fields: ['uuid'],
                condition: {
                  'cluster.uuid': conditionsMap?.['clusterUuid']
                }
              }
            }
          }
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const pxeUuids = results?.[0]?.inventories?.map(cv => cv.uuid)
    const zqlCondition = {
      uuid: {
        [ZOp.in]: pxeUuids
      }
    }

    return zqlCondition
  }
}
