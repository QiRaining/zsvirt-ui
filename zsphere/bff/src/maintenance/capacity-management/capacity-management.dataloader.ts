import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { find as _find } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { QueryPrimaryStorageAction } from '@/api/zstack/QueryPrimaryStorageAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { QueryVolumeAction } from '@/api/zstack/QueryVolumeAction'
import ZQL, { ZQLAction, ZOp } from '@/common/zql/index'

@Injectable()
export class CapacityManagementDataloader {
  @Inject() queryHostAction: QueryHostAction
  @Inject() queryPrimaryStorageAction: QueryPrimaryStorageAction
  @Inject() queryBackupStorageAction: QueryBackupStorageAction
  @Inject() queryVmInstanceAction: QueryVmInstanceAction
  @Inject() queryVolumeAction: QueryVolumeAction
  @Inject() zqlService: ZQLService

  private queryHostDataDataLoader
  private queryPrimaryStorageDataDataLoader
  private queryBackupStorageDataDataLoader
  private queryVmInstanceNameDataLoader
  private querySnapshotResourceDataLoader

  constructor() {
    this.queryHostDataDataLoader = new DataLoader(this._queryHostData)
    this.queryPrimaryStorageDataDataLoader = new DataLoader(this._queryPrimaryStorageData)
    this.queryBackupStorageDataDataLoader = new DataLoader(this._queryBackupStorageData)
    this.queryVmInstanceNameDataLoader = new DataLoader(this._queryVmInstanceName)
    this.querySnapshotResourceDataLoader = new DataLoader(this._querySnapshotResource)
  }

  // Host
  queryHostData(uuid) {
    return this.queryHostDataDataLoader.load(uuid)
  }

  _queryHostData = async (uuids: string[]) => {
    const dataMap = {}
    uuids.forEach(e => (dataMap[e] = { uuid: e }))
    const zqlObject = {
      tableName: 'Host',
      fields: ['uuid'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'zwatch1',
            metricName: 'DiskAllUsedCapacityInPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'zwatch2',
            metricName: 'DiskAllUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'zwatch3',
            metricName: 'DiskAllFreeCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          }
        ]
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [
        {
          inventories: resp0 = [],
          returnWith: { zwatch1: resp1 = [], zwatch2: resp2 = [], zwatch3: resp3 = [] }
        }
      ]
    } = await this.zqlService.call(zql)

    resp1.forEach(e => {
      dataMap[e.labels.HostUuid].usedCapacityPercentage = e.value
    })
    resp2.forEach(e => {
      dataMap[e.labels.HostUuid].usedCapacity = e.value
    })
    resp3.forEach(e => {
      dataMap[e.labels.HostUuid].freeCapacity = e.value
    })
    return uuids.map(uuid => dataMap[uuid])
  }

  // Primary Storage
  queryPrimaryStorageData(uuid) {
    return this.queryPrimaryStorageDataDataLoader.load(uuid)
  }

  _queryPrimaryStorageData = async (uuids: string[]) => {
    const dataMap = {}
    uuids.forEach(e => (dataMap[e] = { uuid: e }))
    const psResp = await this.queryPrimaryStorageAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        }
      ]
    })
    psResp.inventories.forEach(e => {
      dataMap[e.uuid] = {
        ...dataMap[e.uuid],
        totalPhysicalCapacity: +e.totalPhysicalCapacity,
        availablePhysicalCapacity: +e.availablePhysicalCapacity,
        usedPhysicalCapacity: e.totalPhysicalCapacity - e.availablePhysicalCapacity,
        usedPhysicalCapacityPercentage:
          ((e.totalPhysicalCapacity - e.availablePhysicalCapacity) / e.totalPhysicalCapacity) * 100
      }
    })

    for (let i = 0; i < uuids.length; i++) {
      const uuid = uuids[i]
      const zqlObjects = [
        {
          action: ZQLAction.SUM,
          tableName: 'Volume',
          fields: ['actualSize', 'size'],
          sumBy: 'type',
          condition: {
            'primaryStorage.uuid': uuid
          }
        },
        {
          action: ZQLAction.SUM,
          tableName: 'imagecache',
          fields: ['size'],
          sumBy: 'mediaType',
          condition: {
            primaryStorageUuid: uuid
          }
        },
        {
          action: ZQLAction.SUM,
          tableName: 'InstallPathRecycle',
          fields: ['size'],
          sumBy: 'storageUuid',
          condition: {
            storageUuid: uuid
          }
        },
        {
          tableName: 'PrimaryStorageCapacity',
          fields: ['systemUsedCapacity'],
          condition: {
            uuid: uuid
          }
        }
      ]
      const zql = ZQL.multStringify(zqlObjects)
      const {
        results: [
          { inventories: resp1 = [] },
          { inventories: resp2 = [] },
          { inventories: resp3 = [] },
          { inventories: resp4 = [] }
        ]
      } = await this.zqlService.call(zql)
      dataMap[uuid] = {
        ...dataMap[uuid],
        rootVolumeSize: 0,
        dataVolumeSize: 0,
        imageCacheSize: 0,
        trashSize: 0,
        systemSize: 0
      }
      resp1.forEach(e => {
        if (e[0] === 'Root') {
          dataMap[uuid].rootVolumeSize += e[1]
        }
        if (e[0] === 'Data') {
          dataMap[uuid].dataVolumeSize += e[1]
        }
      })
      resp2.forEach(e => {
        dataMap[uuid].imageCacheSize += e[1]
      })
      resp3.forEach(e => {
        dataMap[uuid].trashSize += e[1]
      })
      resp4.forEach(e => {
        dataMap[uuid].systemSize += e.systemUsedCapacity || 0
      })
    }

    return uuids.map(uuid => dataMap[uuid])
  }

  // Backup Storage
  queryBackupStorageData(uuid) {
    return this.queryBackupStorageDataDataLoader.load(uuid)
  }

  _queryBackupStorageData = async (uuids: string[]) => {
    const dataMap = {}
    uuids.forEach(e => (dataMap[e] = { uuid: e }))
    const resp = await this.queryBackupStorageAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        }
      ]
    })
    resp.inventories.forEach(e => {
      dataMap[e.uuid] = {
        ...dataMap[e.uuid],
        totalCapacity: +e.totalCapacity,
        availableCapacity: +e.availableCapacity,
        usedCapacity: e.totalCapacity - e.availableCapacity,
        usedCapacityPercentage: ((e.totalCapacity - e.availableCapacity) / e.totalCapacity) * 100
      }
    })

    for (let i = 0; i < uuids.length; i++) {
      const uuid = uuids[i]
      const zqlObjects = [
        {
          action: ZQLAction.SUM,
          tableName: 'Image',
          fields: ['actualSize', 'size'],
          sumBy: 'mediaType',
          condition: {
            'backupStorage.uuid': uuid
          }
        },
        {
          action: ZQLAction.SUM,
          tableName: 'VolumeBackup',
          fields: ['size'],
          sumBy: 'type',
          condition: {
            'backupStorage.uuid': uuid
          }
        },
        {
          action: ZQLAction.SUM,
          tableName: 'InstallPathRecycle',
          fields: ['size'],
          sumBy: 'storageUuid',
          condition: {
            storageUuid: uuid
          }
        }
      ]
      const zql = ZQL.multStringify(zqlObjects)
      const {
        results: [
          { inventories: resp1 = [] },
          { inventories: resp2 = [] },
          { inventories: resp3 = [] }
        ]
      } = await this.zqlService.call(zql)
      dataMap[uuid] = {
        ...dataMap[uuid],
        imageSize: 0,
        backupSize: 0,
        trashSize: 0
      }
      resp1.forEach(e => {
        dataMap[uuid].imageSize += e[1]
      })
      resp2.forEach(e => {
        dataMap[uuid].backupSize += e[1]
      })
      resp3.forEach(e => {
        dataMap[uuid].trashSize += e[1]
      })
    }

    return uuids.map(uuid => dataMap[uuid])
  }

  // VmInstance
  queryVmInstanceName(uuid) {
    return this.queryVmInstanceNameDataLoader.load(uuid)
  }

  _queryVmInstanceName = async (uuids: string[]) => {
    const dataMap = {}
    const zqlObject = {
      tableName: 'VmInstance',
      fields: ['uuid', 'name'],
      sumBy: 'mediaType',
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    resp.forEach(e => {
      dataMap[e.uuid] = e.name || ''
    })

    return uuids.map(uuid => dataMap[uuid])
  }

  // Snapshot
  querySnapshotResource(uuid) {
    return this.querySnapshotResourceDataLoader.load(uuid)
  }

  _querySnapshotResource = async (uuids: string[]) => {
    const dataMap = {}
    uuids.forEach(e => (dataMap[e] = { uuid: e }))
    const resp1 = await this.queryVmInstanceAction.call({
      conditions: [
        {
          key: 'rootVolume.uuid',
          op: Op.in,
          values: uuids
        }
      ]
    })
    resp1.inventories.forEach(e => {
      dataMap[e.rootVolumeUuid] = {
        ...dataMap[e.rootVolumeUuid],
        resourceUuid: e.uuid,
        resourceType: 'VmInstance',
        resourceName: e.name
      }
    })
    const resp2 = await this.queryVolumeAction.call({
      conditions: [
        {
          key: 'uuid',
          op: Op.in,
          values: uuids
        },
        {
          key: 'type',
          op: Op.in,
          values: ['Data']
        }
      ]
    })
    resp2.inventories.forEach(e => {
      dataMap[e.uuid] = {
        ...dataMap[e.uuid],
        resourceUuid: e.uuid,
        resourceType: 'Volume',
        resourceName: e.name
      }
    })

    return uuids.map(uuid => dataMap[uuid])
  }
}
