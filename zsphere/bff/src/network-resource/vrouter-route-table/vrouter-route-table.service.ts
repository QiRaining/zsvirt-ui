import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { conditionsToObject, Op, QueryParam as IQueryParam } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryVirtualRouterVRouterRouteTableRefAction } from '@/api/zstack/QueryVirtualRouterVRouterRouteTableRefAction'
import { QueryVpcHaGroupAction } from '@/api/zstack/QueryVpcHaGroupAction'
import { QueryVRouterRouteEntryAction } from '@/api/zstack/QueryVRouterRouteEntryAction'
import { QueryVRouterRouteTableAction } from '@/api/zstack/QueryVRouterRouteTableAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'
import { QueryConditionTranslator } from '@/common/zql/queryConditionTranslator'
import { ZqlObject } from '@/common/zql/zqlBuilder'
// import { VRouterRouteEntryType } from './vrouter-route-table.model'

@Injectable()
export class VRouterRouteTableService extends ActionService {
  @Inject() queryVRouterRouteTableAction: QueryVRouterRouteTableAction
  @Inject() queryVRouterRouteEntryAction: QueryVRouterRouteEntryAction
  @Inject() queryVpcHaGroupAction: QueryVpcHaGroupAction
  @Inject()
  queryVirtualRouterVRouterRouteTableRefAction: QueryVirtualRouterVRouterRouteTableRefAction

  private attachedRouterDataLoader

  @Inject() zqlService: ZQLService

  constructor() {
    super()
    this.attachedRouterDataLoader = new DataLoader(this._getAttachedRouter)
  }

  async queryList(params: QueryAction) {
    const zqlObj: ZqlObject = {
      tableName: 'vrouterroutetable'
    }

    // 查路由器的话要补充查询高可用组。
    const vRouterUuidCondition = params.conditions.find(
      ({ key }) => key === 'attachedRouterRef.virtualRouterVm.uuid'
    )
    if (vRouterUuidCondition) {
      const vRouterUuid = vRouterUuidCondition.value
      const haZql = ZQL.stringify({
        tableName: 'VpcHaGroup',
        fields: 'uuid',
        condition: {
          'vrRefs.uuid': vRouterUuid
        }
      })
      const { results: haResults } = await this.zqlService.call(haZql)
      const ha = haResults?.[0]?.inventories?.[0] ?? {}

      if (ha.uuid) {
        params.conditions = params.conditions.filter(
          ({ key }) => key !== 'attachedRouterRef.virtualRouterVm.uuid'
        )
        zqlObj.condition = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VpcHaGroupNetworkServiceRef.networkServiceUuid',
                condition: {
                  vpcHaRouterUuid: ha.uuid,
                  networkServiceName: 'VRouterRouteTableVO'
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObj))

    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(zql)

    return {
      list,
      total
    }
  }

  async queryVRouterRouteEntryList(params: QueryAction) {
    const zqlObj: ZqlObject = {
      tableName: 'VRouterRouteEntry'
    }

    const {
      results: [{ inventories: list = [], total = 0 } = {}]
    } = await this.zqlService.call(
      ZQL.stringify(QueryConditionTranslator.mergeQueryAction(params, zqlObj))
    )

    return {
      list,
      total
    }
  }

  async getAttachedRouter(tableUuid: string) {
    return this.attachedRouterDataLoader.load(tableUuid)
  }
  _getAttachedRouter = async (tableUuids: string[]) => {
    return tableUuids.map(async tableUuid => {
      const matchService = service =>
        service.networkServiceName === 'VRouterRouteTableVO' &&
        service.networkServiceUuid === tableUuid

      const q1 = this.queryVirtualRouterVRouterRouteTableRefAction.call({
        conditions: [
          {
            key: 'routeTableUuid',
            op: Op.eq,
            value: tableUuid
          }
        ]
      })

      const q2 = this.queryVpcHaGroupAction.call({})

      const [routerRef, groupResp] = await Promise.all([q1, q2])

      const virtualRouterVmUuidList = routerRef.inventories.map(v => v.virtualRouterVmUuid)
      const hasTable = group => group.services.some(matchService)
      const vpcInGroupUuids = _.flatten(
        groupResp.inventories.filter(hasTable).map(v => v.vrRefs.map(t => t.uuid))
      )
      return _.uniq(virtualRouterVmUuidList.concat(vpcInGroupUuids))
    })
  }
}
