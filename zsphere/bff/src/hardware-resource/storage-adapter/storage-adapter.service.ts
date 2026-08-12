import { Injectable, Inject } from '@nestjs/common'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { Op } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp, ZQLAction, ZQLFn } from '@/common/zql'

import { HardwareState } from '../host/host.model'

@Injectable()
export class StorageAdapterService {
  @Inject() private zqlService: ZQLService

  async queryStorageAdapterList(params: QueryAction) {
    const hostUuid = params.conditions?.find(condition => condition.key === 'hostUuid')?.value
    if (!hostUuid) {
      return { list: [], total: 0 }
    }
    const hostZqlObject = {
      tableName: 'host',
      condition: {
        uuid: {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const fcHbaZqlObject = {
      tableName: 'FcHbaDevice',
      condition: {
        hostUuid: {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const iscsiTargetCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'IscsiTarget',
      condition: {
        'iscsiLun.scsiLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const iscsiLunCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'IscsiLun',
      condition: {
        'scsiLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const nvmeTargetCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'NvmeTarget',
      condition: {
        'nvmeLun.nvmeLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        },
        'nvmeLun.nvmeLunHostRef.transport': {
          [ZOp.ne]: 'PCIE'
        }
      }
    }
    const nvmeLunCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'NvmeLun',
      condition: {
        'nvmeLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        },
        'nvmeLunHostRef.transport': {
          [ZOp.ne]: 'PCIE'
        }
      }
    }
    const nvmeTransportZqlObject = {
      tableName: 'NvmeLunHostRef',
      fnName: ZQLFn.distinct,
      fields: ['transport'],
      condition: {
        transport: {
          [ZOp.ne]: 'PCIE'
        },
        hostUuid: {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const fcTargetCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'FiberChannelStorage',
      condition: {
        'fiberChannelLun.scsiLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const fcLunCountZqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'FiberChannelLun',
      condition: {
        'scsiLunHostRef.hostUuid': {
          [ZOp.eq]: hostUuid
        }
      }
    }
    const {
      results: [
        { inventories: [host] = [] },
        { inventories: fcHbaResp = [] },
        { total: iscsiTargetCount = 0 },
        { total: iscsiLunCount = 0 },
        { total: nvmeTargetCount = 0 },
        { total: nvmeLunCount = 0 },
        { inventories: nvmeTransportList = [] },
        { total: fcTargetCount = 0 },
        { total: fcLunCount = 0 }
      ]
    } = await this.zqlService.call(
      ZQL.multStringify([
        hostZqlObject,
        fcHbaZqlObject,
        iscsiTargetCountZqlObject,
        iscsiLunCountZqlObject,
        nvmeTargetCountZqlObject,
        nvmeLunCountZqlObject,
        nvmeTransportZqlObject,
        fcTargetCountZqlObject,
        fcLunCountZqlObject
      ])
    )

    const iscsi = [
      {
        name: 'hba0',
        type: 'iSCSI',
        model: 'iSCSI Software Adapter',
        identifier: host?.iscsiInitiatorName,
        target: iscsiTargetCount,
        device: iscsiLunCount,
        hostUuid
      }
    ]

    const transport = nvmeTransportList.map(item => item.transport)
    const nvme = [
      {
        name: 'hba1',
        model: 'NVMe over Fabrics Storage Adapter',
        type: 'NVMe',
        identifier: host?.nqn,
        transport,
        target: nvmeTargetCount,
        device: nvmeLunCount,
        hostUuid
      }
    ]
    const fcHbaList = fcHbaResp.map((fcHba, index) => ({
      name: `hba${index + 2}`,
      state: fcHba.portState,
      model: fcHba.symbolicName,
      type: 'FC',
      identifier: `${fcHba.nodeName},${fcHba.portName}`,
      speed: fcHba.speed,
      target: fcTargetCount,
      device: fcLunCount,
      hostUuid
    }))
    let list = [...iscsi, ...nvme, ...fcHbaList]

    // 过滤条件
    const filterFnList = []
    const nameSearchValue = params.conditions
      ?.find(condition => condition.key === 'name' && condition.op === Op.like)
      ?.value?.trim()
      .toLowerCase()
    const identifierSearchValue = params.conditions
      ?.find(condition => condition.key === 'identifier' && condition.op === Op.like)
      ?.value?.trim()
      .toLowerCase()
    const modelSearchValue = params.conditions
      ?.find(condition => condition.key === 'model' && condition.op === Op.like)
      ?.value?.trim()
      .toLowerCase()
    const stateCondition = params.conditions?.find(condition => condition.key === 'state')?.values
    if (stateCondition?.length) {
      const stateConditionMap = {
        [HardwareState.Normal]: item => item.state === 'Online',
        [HardwareState.Abnormal]: item => !!item.state && item.state !== 'Online',
        [HardwareState.Unknown]: item => !item.state
      }
      const conditionFns = stateCondition.map(state => stateConditionMap[state])
      filterFnList.push(item => conditionFns.some(fn => fn(item)))
    }
    const typeCondition = params.conditions?.find(condition => condition.key === 'type')?.values
    if (typeCondition?.length) {
      filterFnList.push(item => typeCondition.includes(item.type))
    }
    if (nameSearchValue) {
      filterFnList.push(item => item.name.toLowerCase().includes(nameSearchValue))
    }
    if (identifierSearchValue) {
      filterFnList.push(item => item.identifier?.toLowerCase().includes(identifierSearchValue))
    }
    if (modelSearchValue) {
      filterFnList.push(item => item.model?.toLowerCase().includes(modelSearchValue))
    }
    if (filterFnList.length) {
      list = list.filter(item => filterFnList.every(fn => fn(item)))
    }

    // 排序
    if (params.sortBy === 'name') {
      const sortFn =
        params.sortDirection === 'asc'
          ? (a, b) => a.name.localeCompare(b.name)
          : (a, b) => b.name.localeCompare(a.name)
      list = list.sort(sortFn)
    }

    // 分页
    const total = list.length
    const start = params.start || 0
    const limit = params.limit || total
    list = list.slice(start, start + limit)

    return { list, total }
  }

  async countStorageAdapter(params: QueryAction) {
    const hostUuid = params.conditions?.find(condition => condition.key === 'hostUuid')?.value
    if (!hostUuid) {
      return { total: 0 }
    }
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'FcHbaDevice',
      condition: {
        hostUuid: {
          [ZOp.eq]: hostUuid
        }
      }
    })
    const resp = await this.zqlService.call(zql)
    const fcHbaCount = resp?.results?.[0]?.total ?? 0
    const nvmeCount = 1
    const iscsiCount = 1
    return { total: fcHbaCount + nvmeCount + iscsiCount }
  }
}
