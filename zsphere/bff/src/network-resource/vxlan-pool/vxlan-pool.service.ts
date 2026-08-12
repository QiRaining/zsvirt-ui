import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { reduce as _reduce } from 'lodash'

import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateL2VxlanNetworkPoolAction } from '@/api/zstack/CreateL2VxlanNetworkPoolAction'
import { CreateVniRangeAction } from '@/api/zstack/CreateVniRangeAction'
import { DeleteVniRangeAction } from '@/api/zstack/DeleteVniRangeAction'
import { QueryClusterAction } from '@/api/zstack/QueryClusterAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryL2VxlanNetworkPoolAction } from '@/api/zstack/QueryL2VxlanNetworkPoolAction'
import { QueryVniRangeAction } from '@/api/zstack/QueryVniRangeAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { UpdateVniRangeAction } from '@/api/zstack/UpdateVniRangeAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql'
import { ClusterService } from '@/hardware-resource/cluster/cluster.service'
import { L2NetworkQueryType } from '@/hardware-resource/l2-network/l2.network.model'
import { L2NetworkService } from '@/hardware-resource/l2-network/l2.network.service'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'

import {
  VniRangeResp,
  VxlanPoolQueryResp,
  VxlanPoolQueryType,
  VxlanPoolQueryVtepResp,
  VxlanPoolRelatedResource
} from './vxlan-pool.model'

@Injectable()
export class VxlanPoolService extends ActionService {
  @Inject() queryL2VxlanNetworkPoolAction: QueryL2VxlanNetworkPoolAction

  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject() attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction

  @Inject() queryVniRangeAction: QueryVniRangeAction
  @Inject() createVniRangeAction: CreateVniRangeAction
  @Inject() deleteVniRangeAction: DeleteVniRangeAction
  @Inject() updateVniRangeAction: UpdateVniRangeAction
  @Inject() createL2VxlanNetworkPoolAction: CreateL2VxlanNetworkPoolAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryClusterAction: QueryClusterAction
  @Inject() zqlService: ZQLService
  @Inject() l2NetworkService: L2NetworkService
  @Inject() clusterService: ClusterService
  @Inject() sharedResourceQueryService: SharedResourceQueryService

  private vniRangeDataloader

  constructor() {
    super()
    this.vniRangeDataloader = new DataLoader(this._vniRange)
  }

  async query(params: QueryAction): Promise<VxlanPoolQueryResp> {
    const { type = VxlanPoolQueryType.NORMAL } = params
    let finalZqlCondition: any = {}
    let _resultResp = null

    switch (type) {
      case VxlanPoolQueryType.NORMAL:
        break
      case 'SHARED_RESOURCE':
        finalZqlCondition = await this.sharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'L2NetworkVO'
        )
        break
    }
    const zqlCondition = QueryConditionTranslator.translate(params.conditions, finalZqlCondition)

    _resultResp = await this.getVxlanPoolList(params, zqlCondition)

    return _resultResp
  }
  async getVxlanPoolList(param: QueryAction, zqlCondition: any) {
    const zqlObject = {
      tableName: 'L2VxlanNetworkPool',
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

    //解析attachedCidrs,生成attachedCidr数组
    const vxlanPools = results?.[0]?.inventories?.map(cv => {
      const attachedCidr = Object.values(cv?.attachedCidrs ?? {})
      return {
        ...cv,
        attachedCidr,
        vtepNum: cv?.attachedVtepRefs?.length
      }
    })
    const total = results?.[0]?.total ?? 0
    return {
      list: vxlanPools,
      total: total
    }
  }

  async vxlanpoolRelatedResource(uuid: string) {
    const countList: VxlanPoolRelatedResource = {
      vxlan: 0,
      cluster: 0
    }
    await Promise.all([
      this.l2NetworkService
        .query({
          type: L2NetworkQueryType.AttachedVxlanNetwork,
          extraConditions: [
            {
              key: 'vxlanPooUuuid',
              op: Op.eq,
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.vxlan = resp?.list?.length
          },
          () => {
            countList.vxlan = 0
          }
        ),
      this.clusterService
        .clusterList({
          conditions: [{ key: 'l2Network.uuid', op: Op.eq, value: uuid }],
          extraConditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: uuid
            }
          ]
        })
        .then(
          resp => {
            countList.cluster = resp.total
          },
          () => {
            countList.cluster = 0
          }
        )
    ])

    return countList
  }

  async queryVtep(params: QueryAction): Promise<VxlanPoolQueryVtepResp> {
    const { inventories, total } = await this.queryL2VxlanNetworkPoolAction.call(params)
    const attachedVtep = inventories?.[0].attachedVtepRefs
    return {
      list: attachedVtep,
      total: total || 0
    }
  }

  async queryVniRange(params): Promise<VniRangeResp> {
    const { inventories, total } = await this.queryVniRangeAction.call(params)
    return {
      list: inventories,
      total: total
    }
  }

  private _vniRange = async (vxlanPoolUuids: string[]) => {
    const prarms = {
      conditions: [
        {
          key: 'vxlanPool.uuid',
          op: Op.in,
          values: vxlanPoolUuids
        }
      ]
    }

    const { inventories } = await this.queryVniRangeAction.call(prarms)

    const vxlanPoolMap = _reduce(
      inventories,
      (obj, curr) => {
        if (!obj[curr.l2NetworkUuid]) {
          obj[curr.l2NetworkUuid] = [curr]
        } else {
          obj[curr.l2NetworkUuid].push(curr)
        }
        return obj
      },
      {}
    )

    return vxlanPoolUuids.map(uuid => vxlanPoolMap[uuid] ?? [])
  }

  vniRange(vxlanPoolUuid: string) {
    return this.vniRangeDataloader.load(vxlanPoolUuid)
  }
}
