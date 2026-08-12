import { Injectable, Inject } from '@nestjs/common'
import { pick as _pick, cloneDeep as _cloneDeep } from 'lodash'

import { Op, Condition as ICondition, conditionsToObject } from '@/api/zstack/base/query-base'
import { extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetCandidateZonesClustersHostsForCreatingVmAction,
  GetCandidateZonesClustersHostsForCreatingVmActionParam as IGetCandidateZonesClustersHostsForCreatingVmActionParam
} from '@/api/zstack/GetCandidateZonesClustersHostsForCreatingVmAction'
import {
  GetPciDeviceSpecCandidatesAction,
  GetPciDeviceSpecCandidatesActionParam
} from '@/api/zstack/GetPciDeviceSpecCandidatesAction'
import { QueryPciDeviceSpecAction } from '@/api/zstack/QueryPciDeviceSpecAction'
import { UpdatePciDeviceSpecAction } from '@/api/zstack/UpdatePciDeviceSpecAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction, QueryConditionTranslator } from '@/common/zql'
import { mergeZqlObject } from '@/common/zql/queryConditionTranslator'

@Injectable()
export class PciDeviceSpecService extends ActionService {
  @Inject() queryPciDeviceSpecAction: QueryPciDeviceSpecAction
  @Inject()
  getPciDeviceSpecCandidatesAction: GetPciDeviceSpecCandidatesAction
  @Inject()
  getCandidateZonesClustersHostsForCreatingVmAction: GetCandidateZonesClustersHostsForCreatingVmAction
  @Inject()
  updatePciDeviceSpecAction: UpdatePciDeviceSpecAction
  @Inject()
  zqlService: ZQLService

  async queryPciDeviceSpec(params: QueryAction) {
    params = { replyWithCount: true, ...params }
    const type = params.type
    let finalConditions: ICondition[] = []
    let zqlCondtion
    let finalZqlCondition
    switch (type) {
      case 'gpu':
        finalConditions = finalConditions.concat([
          { key: 'isVirtual', op: Op.eq, value: 'false' },
          {
            key: 'type',
            op: Op.in,
            values: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        ])
        break
      case 'vgpu':
        finalConditions = finalConditions.concat([
          { key: 'isVirtual', op: Op.eq, value: 'true' },
          {
            key: 'type',
            op: Op.in,
            values: ['GPU_Video_Controller', 'GPU_3D_Controller']
          }
        ])
        break
      case 'candidateForAttachToVm':
        zqlCondtion = this.getCandidateForAttachToVm(params.extraConditions)
        break
      case 'candidateForCreatingVm':
        zqlCondtion = await this.getCandidateForCreatingVm(params.extraConditions)
        break
    }

    const [_conditions, conditionMap] = extractAndRemoveExtraCondition(
      _cloneDeep(params.conditions.concat(finalConditions)),
      ['shareType']
    )
    if (conditionMap.shareType) {
      const { values = [] } = conditionMap.shareType
      finalZqlCondition = QueryConditionTranslator.generateShareTypeZqlConditon(
        values,
        'PciDeviceSpecVO'
      )
    }
    params.conditions = _conditions
    let zql = QueryConditionTranslator.mergeQueryAction(params, {
      tableName: 'pcidevicespec',
      condition: zqlCondtion
    })
    if (finalZqlCondition) {
      zql = mergeZqlObject(zql, {
        condition: finalZqlCondition
      })
    }

    const zqls = ZQL.stringify(zql)
    const resp = await this.zqlService.call(zqls)
    return {
      list: resp.results[0].inventories,
      total: resp.results[0].total
    }
  }

  async getCandidateForCreatingVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['clusterUuids', 'hostUuid', 'types']
    const clustersCandidateKeys = [
      'defaultL3NetworkUuid',
      'imageUuid',
      'instanceOfferingUuid',
      'l3NetworkUuids',
      'rootDiskOfferingUuid',
      'cpuNum',
      'memorySize'
    ]

    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceSpecCandidatesActionParam
    const clusterscandidateParams = _pick(
      conditionsMap,
      clustersCandidateKeys
    ) as IGetCandidateZonesClustersHostsForCreatingVmActionParam

    // UI 没有传clusters参数时，通过getCandidateZonesClustersHostsForCreatingVmAction来获取可以用于创建云主机的clusters
    if (!candidateParams.clusterUuids && clusterscandidateParams.imageUuid) {
      const clustersResp =
        await this.getCandidateZonesClustersHostsForCreatingVmAction.call(clusterscandidateParams)
      candidateParams.clusterUuids = clustersResp.clusters.map(item => item.uuid)
    }

    const condition: any = {
      types: {
        [ZOp.in]: candidateParams.types
      }
    }
    if (candidateParams.hostUuid) {
      condition.hostUuid = candidateParams.hostUuid
    }

    // GetPciDeviceSpecCandidates 中 clusteruuids 和hostuuid不能同时使用
    if (candidateParams?.hostUuid) {
      condition.hostUuid = candidateParams?.hostUuid
    } else {
      condition.clusterUuids = {
        [ZOp.in]: candidateParams?.clusterUuids ?? []
      }
    }

    const zqlObj = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPciDeviceSpecCandidates',
            output: 'inventories.uuid',
            condition
          }
        }
      },
      isVirtual: 'false'
    }

    return zqlObj
  }

  getCandidateForAttachToVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['types', 'vmInstanceUuids']
    const candidateParams = _pick(
      conditionsMap,
      candidateKeys
    ) as GetPciDeviceSpecCandidatesActionParam

    const zqlObj = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetPciDeviceSpecCandidates',
            output: 'inventories.uuid',
            condition: {
              types: {
                [ZOp.in]: candidateParams.types
              },
              vmInstanceUuids: {
                [ZOp.in]: candidateParams.vmInstanceUuids
              }
            }
          }
        }
      },
      isVirtual: 'false'
    }
    return zqlObj
  }
}
