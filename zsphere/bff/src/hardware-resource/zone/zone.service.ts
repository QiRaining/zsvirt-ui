import { Inject, Injectable } from '@nestjs/common'
import { cloneDeep } from 'lodash'

import { extractAndRemoveExtraCondition, QueryParam } from '@/api/zstack/base/query-base'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryZoneAction } from '@/api/zstack/QueryZoneAction'
import { ZoneInventory } from '@/api/zstack/types'
import { ValidatePasswordAction } from '@/api/zstack/ValidatePasswordAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'
import ZQL, { ZOp, ZQLAction } from '@/common/zql'
import { arrayToMap } from '@/common/zql/queryConditionTranslator'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { l2NetworkType } from '../l2-network/l2.network.model'
import {
  Zone as IZone,
  ZoneResponse as IZoneResponse,
  VirtualizationZoneRelatedSummary,
  ZoneRelatedSummary
} from './zone.model'

@Injectable()
export class ZoneService extends ActionService {
  @Inject() zsHttpService: ZsHttpService
  @Inject() webhookCallbackService: WebhookCallbackService
  @Inject() zqlService: ZQLService
  @Inject() queryZoneAction: QueryZoneAction
  @Inject() validatePasswordAction: ValidatePasswordAction
  @Inject() ZQLService: ZQLService

  transform(item: ZoneInventory): IZone {
    const zone: IZone = {} as IZone
    zone.uuid = item.uuid
    zone.name = item.name
    zone.description = item.description
    zone.createDate = item.createDate
    zone.lastOpDate = item.lastOpDate
    zone.state = item.state
    zone.isDefault = item.isDefault
    return zone
  }

  async getZone(uuid: string): Promise<IZone> {
    const query = {} as QueryParam
    query.conditions = [
      {
        key: 'uuid',
        value: uuid
      }
    ]
    const { inventories } = await this.queryZoneAction.call(query)
    if (inventories.length === 1) {
      return this.transform(inventories[0])
    } else {
      return null
    }
  }

  async getZoneList(params: QueryAction): Promise<IZoneResponse> {
    const clone = cloneDeep(params)
    const { extraConditions } = clone
    const [, conditionsMap] = extractAndRemoveExtraCondition(extraConditions, ['virtualID'])

    const { inventories, total } = await this.queryZoneAction.call(params)
    const zones: IZone[] = inventories.map(item => {
      return this.transform(item)
    })
    return {
      total,
      list: zones
    }
  }

  async getCount(
    zoneUuid: string,
    entity:
      | 'Cluster'
      | 'PrimaryStorage'
      | 'L2Network'
      | 'VmInstance'
      | 'Volume'
      | 'BackupStorage'
      | 'Host'
  ): Promise<number> {
    let condition: ZqlObject['condition'] = {
      zoneUuid
    }

    let _entity: string = entity as string

    if (entity === 'Volume') {
      condition = {
        'primaryStorage.zoneUuid': zoneUuid,
        type: 'Data'
      }
    }

    if (entity === 'BackupStorage') {
      _entity = 'BackupStorageZoneRef'
    }

    const zqlObject: ZqlObject = {
      action: ZQLAction.COUNT,
      tableName: _entity,
      condition: condition
    }

    const zql = ZQL.stringify(zqlObject)

    const { results } = await this.zqlService.call(zql)

    return results?.[0]?.total || 0
  }

  // 查询主存储相关资源数量
  async getZoneRelatedSummary(zoneUuid: string): Promise<ZoneRelatedSummary> {
    const clusterCondition = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        zoneUuid,
        hypervisorType: {
          [ZOp.notIn]: ['ESX', 'baremetal', 'baremetal2']
        }
      }
    }

    const baremetalClusterCondition = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        zoneUuid,
        hypervisorType: 'baremetal'
      }
    }

    const baremetal2ClusterCondition = {
      action: ZQLAction.COUNT,
      tableName: 'Cluster',
      condition: {
        zoneUuid,
        hypervisorType: 'baremetal2'
      }
    }

    const primaryStorageCondition = {
      action: ZQLAction.COUNT,
      tableName: 'PrimaryStorage',
      condition: {
        zoneUuid,
        type: {
          [ZOp.ne]: 'VCenter'
        }
      }
    }

    const backupStorageCondition = {
      action: ZQLAction.COUNT,
      tableName: 'backupstorage',
      condition: {
        'zone.uuid': zoneUuid,
        type: {
          [ZOp.ne]: 'VCenter'
        },
        __systemTag__: {
          [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
        }
      }
    }

    const l2NetworkCondition = {
      action: ZQLAction.COUNT,
      tableName: 'L2Network',
      condition: {
        type: {
          [ZOp.in]: Object.keys(l2NetworkType)
        },
        zoneUuid,
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'l2networkclusterRef',
              fields: ['l2NetworkUuid'],
              condition: {
                clusterUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'cluster',
                      fields: ['uuid'],
                      condition: {
                        type: 'vmware'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const conds = [
      clusterCondition,
      primaryStorageCondition,
      l2NetworkCondition,
      backupStorageCondition,
      baremetalClusterCondition,
      baremetal2ClusterCondition
    ]
    const zql = ZQL.multStringify(conds)

    const { results } = await this.zqlService.call(zql)
    const [
      clusterTotal,
      primaryStorageTotal,
      l2NetworkTotal,
      backupStorageTotal,
      baremetalClusterTotal,
      baremetal2ClusterTotal
    ] = results.map(t => t.total)

    return {
      clusterTotal,
      primaryStorageTotal,
      l2NetworkTotal,
      backupStorageTotal,
      baremetalClusterTotal,
      baremetal2ClusterTotal
    }
  }

  async getL2CountConditon(zoneUuid: string) {
    const zqlObj = {
      tableName: 'L2Network',
      condition: {
        zoneUuid
      }
    }

    const { results: [{ inventories: l2 }] = [] } = await this.zqlService.call(
      ZQL.stringify(zqlObj)
    )

    const l2HasCluster = l2.filter(item => item.attachedClusterUuids.length > 0)
    const zqlClusterObj = {
      tableName: 'cluster',
      condition: {
        uuid: {
          [ZOp.in]: l2HasCluster.map(({ attachedClusterUuids: [{ uuid }] }) => uuid)
        },
        type: 'vmware'
      }
    }

    const { results: [{ inventories: clusterList }] = [] } = await this.zqlService.call(
      ZQL.stringify(zqlClusterObj)
    )

    const clusterMap = arrayToMap(clusterList)
    const uuidList = l2.filter((_l2: any) => {
      const { attachedClusterUuids } = _l2
      const clusterUuid = attachedClusterUuids?.[0]?.uuid
      return !clusterUuid || !clusterMap[clusterUuid]
    })

    return {
      condition: {
        uuid: {
          [ZOp.in]: uuidList.map(({ uuid }) => uuid)
        }
      }
    }
  }

  //虚拟化版本
  // 查询主存储相关资源数量
  async getVirtualizationZoneRelatedSummary(
    uuid: string
  ): Promise<VirtualizationZoneRelatedSummary> {
    //增加对应的查询条件：

    const virInstanceCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'vminstance',
      condition: {
        zoneUuid: uuid,
        state: { [ZOp.ne]: 'Destroyed' },
        uuid: {
          [ZOp.notIn]: {
            [ZOp.and]: [
              {
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.and]: {
                      [ZOp.query]: {
                        tableName: 'templatedVminstance',
                        fields: ['uuid']
                      }
                    }
                  }
                }
              },
              {
                uuid: {
                  [ZOp.notIn]: {
                    [ZOp.and]: {
                      [ZOp.query]: {
                        tableName: 'templatedVminstanceCache',
                        fields: ['cacheVmInstanceUuid']
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }

    //数据存储
    const virPrimaryStorageCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'primaryStorage',
      condition: {
        zoneUuid: uuid
      }
    }

    const virClusterCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'cluster',
      condition: {
        zoneUuid: uuid
      }
    }

    const virHostCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'host',
      condition: {
        zoneUuid: uuid
      }
    }

    //镜像存储
    const virImageStoreCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'backupStorage',
      condition: {
        'zone.uuid': uuid,
        __systemTag__: {
          [ZOp.notIn]: ['remote', 'onlybackup', 'aliyun', 'remotebackup']
        }
      }
    }

    const virL2NetworkCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'l2network',
      condition: {
        zoneUuid: uuid,
        type: {
          [ZOp.ne]: 'portGroup'
        }
      }
    }

    const virL3NetworkCountZql = {
      action: ZQLAction.COUNT,
      tableName: 'l3network',
      condition: {
        zoneUuid: uuid
      }
    }

    const queryZql = ZQL.multStringify([
      virInstanceCountZql,
      virPrimaryStorageCountZql,
      virClusterCountZql,
      virHostCountZql,
      virImageStoreCountZql,
      virL2NetworkCountZql,
      virL3NetworkCountZql
    ])
    const { results } = await this.ZQLService.call(queryZql)

    const [
      { total: virInstanceCount },
      { total: virPrimaryStorageCount },
      { total: virClusterCount },
      { total: virHostCount },
      { total: virImageStoreCount },
      { total: virL2NetworkCount },
      { total: virL3NetworkCount }
    ] = results

    return {
      virInstanceCount,
      virPrimaryStorageCount,
      virClusterCount,
      virHostCount,
      virImageStoreCount,
      virL2NetworkCount,
      virL3NetworkCount
    }
  }
}
