import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  sumBy as _sumBy,
  compact as _compact,
  flatten as _flatten,
  difference as _difference,
  intersection as _intersection,
  chunk as _chunk,
  isEmpty as _isEmpty
} from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCandidateInterfaceVlanIdsAction } from '@/api/zstack/GetCandidateInterfaceVlanIdsAction'
import { ActionService } from '@/base/action-service'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction, ZQLFn } from '@/common/zql/index'

import { PhysicalNetworkInterfaceService } from '../physical-network-interface/physical-network-interface.service'
import {
  GetInterfaceRelatedSummaryArgs,
  GetInterfaceServiceRelatedSummaryArgs,
  PhysicalNetworkType
} from './physical-network.model'

@Injectable()
export class PhysicalNetworkService extends ActionService {
  @Inject() private readonly zqlService: ZQLService
  @Inject()
  private readonly physicalNetworkInterfaceService: PhysicalNetworkInterfaceService
  @Inject()
  private readonly getCandidateInterfaceVlanIdsAction: GetCandidateInterfaceVlanIdsAction

  private availableVlanIdsLoader

  constructor() {
    super()
    this.availableVlanIdsLoader = new DataLoader(this._availableVlanIds)
  }

  async getPhysicalNetworkRelatedSummary(hostUuid: string) {
    let [
      managementNetworkCount,
      tenantNetworkCount,
      storageNetworkCount,
      backupNetworkCount,
      migrationNetworkCount
    ] = [0, 0, 0, 0, 0]

    let zql = null
    let resp = null

    const queryInterfaceSpecicalCondition = []
    const queryBondSpecicalCondition = []

    if (hostUuid) {
      queryInterfaceSpecicalCondition.push({
        interfaceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkInterface',
              fields: ['uuid'],
              condition: {
                hostUuid
              }
            }
          }
        }
      })

      queryBondSpecicalCondition.push({
        bondingUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'HostNetworkBonding',
              fields: ['uuid'],
              condition: {
                hostUuid
              }
            }
          }
        }
      })
    }

    // 管理网络
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkInterfaceServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.ManagementNetwork
              }
            ],
            queryInterfaceSpecicalCondition
          )
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkBondingServiceRef',
          condition: {
            condition: QueryConditionTranslator.translate(
              [
                {
                  key: 'serviceType',
                  op: ZOp.eq,
                  value: PhysicalNetworkType.ManagementNetwork
                }
              ],
              queryBondSpecicalCondition
            )
          }
        }
      ])
      resp = await this.zqlService.call(zql)
      managementNetworkCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    // 业务网络
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkInterfaceServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.TenantNetwork
              }
            ],
            queryInterfaceSpecicalCondition
          )
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkBondingServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.TenantNetwork
              }
            ],
            queryBondSpecicalCondition
          )
        }
      ])
      resp = await this.zqlService.call(zql)
      tenantNetworkCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    // 存储网络
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkInterfaceServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.StorageNetwork
              }
            ],
            queryInterfaceSpecicalCondition
          )
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkBondingServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.StorageNetwork
              }
            ],
            queryBondSpecicalCondition
          )
        }
      ])
      resp = await this.zqlService.call(zql)
      storageNetworkCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    // 备份网络
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkInterfaceServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.BackupNetwork
              }
            ],
            queryInterfaceSpecicalCondition
          )
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkBondingServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.BackupNetwork
              }
            ],
            queryBondSpecicalCondition
          )
        }
      ])
      resp = await this.zqlService.call(zql)
      backupNetworkCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    // 迁移网络
    try {
      zql = ZQL.multStringify([
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkInterfaceServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.MigrationNetwork
              }
            ],
            queryInterfaceSpecicalCondition
          )
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'HostNetworkBondingServiceRef',
          condition: QueryConditionTranslator.translate(
            [
              {
                key: 'serviceType',
                op: ZOp.eq,
                value: PhysicalNetworkType.MigrationNetwork
              }
            ],
            queryBondSpecicalCondition
          )
        }
      ])
      resp = await this.zqlService.call(zql)
      migrationNetworkCount = _sumBy(_compact(resp?.results), 'total')
    } catch (e) {}

    return {
      managementNetworkCount,
      tenantNetworkCount,
      storageNetworkCount,
      backupNetworkCount,
      migrationNetworkCount
    }
  }

  async getInterfaceServiceRelatedSummary(queryArgs: GetInterfaceServiceRelatedSummaryArgs) {
    let [
      managementNetworkCount,
      tenantNetworkCount,
      storageNetworkCount,
      backupNetworkCount,
      migrationNetworkCount
    ] = [0, 0, 0, 0, 0]

    const specicalConditions = [
      {
        key: 'interfaceType',
        op: ZOp.eq,
        value: 'All'
      }
    ]

    if (queryArgs.zoneUuid) {
      specicalConditions.push({
        key: 'zoneUuid',
        op: ZOp.eq,
        value: queryArgs.zoneUuid
      })
    }

    if (queryArgs.hostUuid) {
      specicalConditions.push({
        key: 'hostUuid',
        op: ZOp.eq,
        value: queryArgs.hostUuid
      })
    }

    if (queryArgs.clusterUuid) {
      specicalConditions.push({
        key: 'clusterUuid',
        op: ZOp.eq,
        value: queryArgs.clusterUuid
      })
    }
    // 管理网络
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'serviceType',
            op: ZOp.in,
            values: [PhysicalNetworkType.ManagementNetwork]
          }
        ]
      })
      managementNetworkCount = total
    } catch (e) {}

    // 业务网络
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'serviceType',
            op: ZOp.in,
            values: [PhysicalNetworkType.TenantNetwork]
          }
        ]
      })
      tenantNetworkCount = total
    } catch (e) {}

    // 存储网络
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'serviceType',
            op: ZOp.in,
            values: [PhysicalNetworkType.StorageNetwork]
          }
        ]
      })
      storageNetworkCount = total
    } catch (e) {}

    // 备份网络
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'serviceType',
            op: ZOp.in,
            values: [PhysicalNetworkType.BackupNetwork]
          }
        ]
      })
      backupNetworkCount = total
    } catch (e) {}

    // 迁移网络
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'serviceType',
            op: ZOp.in,
            values: [PhysicalNetworkType.MigrationNetwork]
          }
        ]
      })
      migrationNetworkCount = total
    } catch (e) {}

    return {
      managementNetworkCount,
      tenantNetworkCount,
      storageNetworkCount,
      backupNetworkCount,
      migrationNetworkCount
    }
  }

  async getCandidateInterfaceVlanIds(uuids: string[]) {
    try {
      const chunkUuids = _chunk(uuids, 5)

      const resultsList: any[] = []
      for (const _uuids of chunkUuids) {
        const results = await Promise.all(
          _uuids.map(uuid =>
            this.getCandidateInterfaceVlanIdsAction.call({
              interfaceUuids: [uuid]
            })
          )
        )

        resultsList.push(...results)
      }

      const vlanIds = _intersection(..._compact(resultsList).map(it => it?.vlanIds ?? []))

      const zql = ZQL.multStringify([
        {
          fnName: ZQLFn.distinct,
          tableName: 'HostNetworkBondingServiceRef',
          fields: ['vlanId'],
          condition: {
            bondingUuid: {
              [ZOp.in]: uuids
            }
          }
        },
        {
          fnName: ZQLFn.distinct,
          tableName: 'HostNetworkInterfaceServiceRef',
          fields: ['vlanId'],
          condition: {
            interfaceUuid: {
              [ZOp.in]: uuids
            }
          }
        }
      ])

      const { results = [] } = await this.zqlService.call(zql)

      const needRemoveVlanIds = _flatten(
        _compact(results).map((it: any) => it?.inventories ?? [])
      ).map(it => it.vlanId)

      return _difference(vlanIds, needRemoveVlanIds)
    } catch {
      return []
    }
  }

  async getInterfaceRelatedSummary(queryArgs: GetInterfaceRelatedSummaryArgs) {
    let [interfaceInterfaceServiceCount, bondingInterfaceServiceCount] = [0, 0]

    const specicalConditions = []

    if (queryArgs.serviceType) {
      specicalConditions.push({
        key: 'serviceType',
        op: ZOp.in,
        values: [queryArgs.serviceType]
      })
    }

    if (queryArgs.zoneUuid) {
      specicalConditions.push({
        key: 'zoneUuid',
        op: ZOp.eq,
        value: queryArgs.zoneUuid
      })
    }

    if (queryArgs.hostUuid) {
      specicalConditions.push({
        key: 'hostUuid',
        op: ZOp.eq,
        value: queryArgs.hostUuid
      })
    }

    if (queryArgs.clusterUuid) {
      specicalConditions.push({
        key: 'clusterUuid',
        op: ZOp.eq,
        value: queryArgs.clusterUuid
      })
    }

    // 未聚合网口
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'interfaceType',
            op: ZOp.eq,
            value: 'Interface'
          }
        ]
      })
      interfaceInterfaceServiceCount = total
    } catch (e) {}

    // 聚合网口
    try {
      const { total } = await this.physicalNetworkInterfaceService.getInterfaceService({
        conditions: [
          ...specicalConditions,
          {
            key: 'interfaceType',
            op: ZOp.eq,
            value: 'Bonding'
          }
        ]
      })
      bondingInterfaceServiceCount = total
    } catch (e) {}

    return {
      interfaceInterfaceServiceCount,
      bondingInterfaceServiceCount
    }
  }

  private _availableVlanIds = async (uuids: string[]) => {
    const chunkUuids = _chunk(uuids, 5)

    const results = []

    for (const _uuids of chunkUuids) {
      const vlanIdsList = await Promise.all(
        _uuids.map(uuid => this.getCandidateInterfaceVlanIds([uuid]))
      )

      results.push(...vlanIdsList)
    }

    return results.map(vlanIds => !_isEmpty(vlanIds))
  }

  availableVlanIds(uuid: string) {
    return this.availableVlanIdsLoader.load(uuid)
  }
}
