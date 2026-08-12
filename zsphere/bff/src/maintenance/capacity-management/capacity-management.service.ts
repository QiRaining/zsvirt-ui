import { Injectable, Inject } from '@nestjs/common'
import { filter as _filter, find as _find } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetManagementNodeDirCapacityAction,
  GetManagementNodeDirCapacityResult
} from '@/api/zstack/GetManagementNodeDirCapacityAction'
import { SortDirectionValidValues } from '@/common/model/action-query.model'
import ZQL, { ZQLAction, ZOp } from '@/common/zql/index'
// import { Op, conditionsToObject } from '@/api/zstack/base/query-base'
// import DataLoader from 'dataloader'

@Injectable()
export class CapacityManagementService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  getManagementNodeDirCapacityAction: GetManagementNodeDirCapacityAction

  /**
   * 获取主存储（Local/Ceph/SharedBlock）的存储信息
   * 总数、可用容量、可用物理容量、总容量、总物理容量
   * @param zoneUuid
   */
  _getPrimaryStorageInfo = async (zoneUuid, type = '') => {
    const zqlObject = {
      tableName: 'PrimaryStorageCapacity',
      fields: [
        'availableCapacity',
        'availablePhysicalCapacity',
        'totalCapacity',
        'totalPhysicalCapacity',
        'systemUsedCapacity'
      ],
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: zoneUuid,
                type: {
                  [ZOp.in]: type ? [type] : ['LocalStorage', 'Ceph', 'SharedBlock']
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      total: 0,
      usedCapacity: 0,
      usedPhysicalCapacity: 0,
      availableCapacity: 0,
      availablePhysicalCapacity: 0,
      totalCapacity: 0,
      totalPhysicalCapacity: 0,
      systemUsedCapacity: 0
    }
    resp.forEach(e => {
      result.total += 1
      result.availableCapacity += e.availableCapacity
      result.availablePhysicalCapacity += e.availablePhysicalCapacity
      result.totalCapacity += e.totalCapacity
      result.totalPhysicalCapacity += e.totalPhysicalCapacity
      result.systemUsedCapacity += e.systemUsedCapacity || 0
      result.usedCapacity += e.totalCapacity - e.availableCapacity
      result.usedPhysicalCapacity += e.totalPhysicalCapacity - e.availablePhysicalCapacity
    })

    return result
  }

  /**
   * 获取根盘/云盘的容量/真实容量统计信息
   * @param zoneUuid
   */
  _getVolumeTotalSize = async (zoneUuid, type = '') => {
    const zqlObject = {
      tableName: 'volume',
      action: ZQLAction.SUM,
      fields: ['actualSize', 'size'],
      sumBy: 'type',
      condition: {
        'primaryStorage.zoneUuid': zoneUuid,
        'primaryStorage.type': {
          [ZOp.in]: type ? [type] : ['LocalStorage', 'Ceph', 'SharedBlock']
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      Data: {
        actualSize: 0,
        size: 0
      },
      Root: {
        actualSize: 0,
        size: 0
      }
    }
    resp.forEach(e => {
      result[e[0]] = {
        actualSize: e[1] || 0,
        size: e[2] || 0
      }
    })

    return result
  }

  /**
   * 获取镜像缓存大小
   * @param zoneUuid
   */
  _getImageCacheSize = async (zoneUuid, type = '') => {
    const zqlObject = {
      tableName: 'imagecache',
      action: ZQLAction.SUM,
      fields: ['size'],
      sumBy: 'mediaType',
      condition: {
        primaryStorageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: zoneUuid,
                type: {
                  [ZOp.in]: type ? [type] : ['LocalStorage', 'Ceph', 'SharedBlock']
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      size: 0
    }
    resp.forEach(e => {
      result.size += e[1]
    })

    return result
  }

  /**
   *
   * @param zoneUuid 获取主存储（Local/Ceph/SharedBlock）中的 Trash 大小
   */
  _getPrimaryStorageTrash = async (zoneUuid, type = '') => {
    const zqlObject = {
      tableName: 'InstallPathRecycle',
      action: ZQLAction.SUM,
      fields: ['size'],
      sumBy: 'storageUuid',
      condition: {
        storageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'PrimaryStorage',
              fields: 'uuid',
              condition: {
                zoneUuid: zoneUuid,
                type: {
                  [ZOp.in]: type ? [type] : ['LocalStorage', 'Ceph', 'SharedBlock']
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      size: 0
    }
    resp.forEach(e => {
      result.size += e[1]
    })

    return result
  }

  /**
   * 获取镜像服务器相关信息
   * 总数、总容量、可用总容量、ImageStore/Ceph 类型的总容量、可用容量
   * @param zoneUuid
   */
  _getBackupStoreInfo = async zoneUuid => {
    const zqlObject = {
      tableName: 'BackupStorage',
      fields: ['totalCapacity', 'availableCapacity', 'type'],
      condition: {
        'zone.uuid': zoneUuid,
        type: {
          [ZOp.in]: ['ImageStoreBackupStorage', 'Ceph']
        },
        __systemTag__: {
          [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      total: 0,
      totalCapacity: 0,
      availableCapacity: 0,
      usedCapacity: 0,
      ImageStoreBackupStorage: {
        totalCapacity: 0,
        availableCapacity: 0,
        usedCapacity: 0
      },
      Ceph: {
        totalCapacity: 0,
        availableCapacity: 0,
        usedCapacity: 0
      }
    }
    resp.forEach(e => {
      result.total += 1
      result.totalCapacity += e.totalCapacity
      result.availableCapacity += e.availableCapacity
      result.usedCapacity += e.totalCapacity - e.availableCapacity
      result[e.type].totalCapacity += e.totalCapacity
      result[e.type].availableCapacity += e.availableCapacity
      result[e.type].usedCapacity += e.totalCapacity - e.availableCapacity
    })

    return result
  }

  /**
   * 获取镜像服务器中的镜像大小，按 ImageStore/Ceph 类型区分
   */
  _getImageSizeInBackupStore = async zoneUuid => {
    const types = ['ImageStoreBackupStorage', 'Ceph']
    const zqlObject = (type: string) => ({
      tableName: 'Image',
      action: ZQLAction.SUM,
      fields: ['actualSize', 'size'],
      sumBy: 'mediaType',
      condition: {
        'backupStorage.zone.uuid': zoneUuid,
        'backupStorage.__systemTag__': {
          [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
        },
        'backupStorage.type': type
      }
    })

    const result = {
      ImageStoreBackupStorage: {
        actualSize: 0,
        size: 0
      },
      Ceph: {
        actualSize: 0,
        size: 0
      }
    }

    const zql = ZQL.multStringify(types.map(e => zqlObject(e)))
    const {
      results: [{ inventories: resp1 = [] }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    resp1.forEach(e => {
      result[types[0]].actualSize += e[1]
      result[types[0]].size += e[2]
    })

    resp2.forEach(e => {
      result[types[1]].actualSize += e[1]
      result[types[1]].size += e[2]
    })

    return result
  }

  /**
   * 获取镜像服务器中的备份相关数据的大小
   */
  _getBackupSizeInBackupStore = async zoneUuid => {
    const zqlObject = {
      tableName: 'VolumeBackup',
      action: ZQLAction.SUM,
      fields: ['size'],
      sumBy: 'type',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VolumeBackupStorageRef',
              fields: 'volumeBackupUuid',
              condition: {
                backupStorageUuid: {
                  [ZOp.in]: {
                    [ZOp.query]: {
                      tableName: 'BackupStorage',
                      fields: 'uuid',
                      condition: {
                        'zone.uuid': zoneUuid,
                        type: {
                          [ZOp.in]: ['ImageStoreBackupStorage']
                        },
                        __systemTag__: {
                          [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
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
    }

    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)
    const result = {
      size: 0
    }
    resp.forEach(e => {
      result.size += e[1]
    })

    return result
  }

  /**
   * 获取镜像服务器中 Trash 大小，根据 ImageStore/Ceph 类型区分
   */
  _getBackupStoreTrashSize = async zoneUuid => {
    const types = ['ImageStoreBackupStorage', 'Ceph']
    const zqlObject = (type: string) => ({
      tableName: 'InstallPathRecycle',
      action: ZQLAction.SUM,
      fields: ['size'],
      sumBy: 'storageUuid',
      condition: {
        storageUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'BackupStorage',
              fields: 'uuid',
              condition: {
                'zone.uuid': zoneUuid,
                type: {
                  [ZOp.in]: [type]
                },
                __systemTag__: {
                  [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
                }
              }
            }
          }
        }
      }
    })

    const result = {
      ImageStoreBackupStorage: {
        actualSize: 0,
        size: 0
      },
      Ceph: {
        actualSize: 0,
        size: 0
      }
    }

    const zql = ZQL.multStringify(types.map(e => zqlObject(e)))
    const {
      results: [{ inventories: resp1 = [] }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    resp1.forEach(e => {
      result[types[0]].actualSize += e[1]
      result[types[0]].size += e[2]
    })

    resp2.forEach(e => {
      result[types[1]].actualSize += e[1]
      result[types[1]].size += e[2]
    })

    return result
  }

  /**
   * 获取云主机（根盘）相关信息
   * 总数、总大小、总实际大小
   */
  _getVmInstance = async zoneUuid => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'VmInstance',
        fields: 'uuid',
        condition: {
          type: 'UserVm',
          hypervisorType: {
            [ZOp.ne]: 'ESX'
          },
          zoneUuid: zoneUuid
        }
      },
      {
        action: ZQLAction.SUM,
        tableName: 'Volume',
        fields: ['actualSize', 'size'],
        sumBy: 'type',
        condition: {
          type: 'Root',
          vmInstanceUuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'VmInstance',
                fields: 'uuid',
                condition: {
                  type: 'UserVm',
                  hypervisorType: {
                    [ZOp.ne]: 'ESX'
                  },
                  zoneUuid: zoneUuid
                }
              }
            }
          }
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const {
      results: [{ total: resp1Total = 0 }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    const result = {
      total: resp1Total,
      actualSize: 0,
      size: 0
    }

    resp2.forEach(e => {
      result.actualSize += e[1]
      result.size += e[2]
    })

    return result
  }

  /**
   * 获取云盘相关信息
   * 总数、总大小、总实际大小
   */
  _getDataVolume = async zoneUuid => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'Volume',
        fields: 'uuid',
        condition: {
          type: 'Data',
          format: {
            [ZOp.ne]: 'vmtx'
          },
          'primaryStorage.zone.uuid': zoneUuid
        }
      },
      {
        action: ZQLAction.SUM,
        tableName: 'Volume',
        fields: ['actualSize', 'size'],
        sumBy: 'type',
        condition: {
          type: 'Data',
          format: {
            [ZOp.ne]: 'vmtx'
          },
          'primaryStorage.zone.uuid': zoneUuid
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const {
      results: [{ total: resp1Total = 0 }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    const result = {
      total: resp1Total,
      actualSize: 0,
      size: 0
    }

    resp2.forEach(e => {
      result.actualSize += e[1]
      result.size += e[2]
    })

    return result
  }

  /**
   * 获取镜像相关信息
   * 总数、总大小、总实际大小
   */
  _getImage = async zoneUuid => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'Image',
        fields: 'uuid',
        condition: {
          'backupStorage.zone.uuid': zoneUuid,
          'backupStorage.__systemTag__': {
            [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          },
          type: 'zstack',
          format: {
            [ZOp.ne]: 'vmtx'
          }
        }
      },
      {
        action: ZQLAction.SUM,
        tableName: 'Image',
        fields: ['actualSize', 'size'],
        sumBy: 'mediaType',
        condition: {
          'backupStorage.zone.uuid': zoneUuid,
          'backupStorage.__systemTag__': {
            [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          },
          type: 'zstack',
          format: {
            [ZOp.ne]: 'vmtx'
          }
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const {
      results: [{ total: resp1Total = 0 }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    const result = {
      total: resp1Total,
      actualSize: 0,
      size: 0
    }

    resp2.forEach(e => {
      result.actualSize += e[1]
      result.size += e[2]
    })

    return result
  }

  /**
   * 获取快照相关信息
   * 总数、总大小
   */
  _getSnapshot = async zoneUuid => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'VolumeSnapshot',
        fields: 'uuid',
        condition: {
          'primaryStorage.zoneUuid': zoneUuid
        }
      },
      {
        action: ZQLAction.SUM,
        tableName: 'VolumeSnapshot',
        fields: 'size',
        sumBy: 'type',
        condition: {
          'primaryStorage.zoneUuid': zoneUuid
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const {
      results: [{ total: resp1Total = 0 }, { inventories: resp2 = [] }]
    } = await this.zqlService.call(zql)

    const result = {
      total: resp1Total,
      size: 0
    }

    resp2.forEach(e => {
      result.size += e[1]
    })

    return result
  }

  /**
   * 获取计算节点相关信息
   * zstack 占用大小、总大小
   */
  _getComputeNode = async zoneUuid => {
    const zqlObject = {
      tableName: 'Host',
      fields: 'uuid',
      condition: {
        zoneUuid: zoneUuid,
        hypervisorType: {
          [ZOp.ne]: 'ESX'
        }
      },
      returnWith: {
        total: true,
        zwatch: [
          {
            resultName: 'zwatch1',
            metricName: 'DiskZStackUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'zwatch2',
            metricName: 'DiskAllUsedCapacityInBytes',
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
          returnWith: { zwatch1: resp1 = [], zwatch2: resp2 = [] }
        }
      ]
    } = await this.zqlService.call(zql)

    const result = {
      zstackSize: 0,
      otherSize: 0,
      totalSize: 0
    }

    resp1.forEach(e => {
      result.zstackSize += e.value
    })
    resp2.forEach(e => {
      result.totalSize += e.value
    })

    result.otherSize = result.totalSize - result.zstackSize

    return result
  }

  /**
   * 获取管理节点信息
   * 总容量、总已用、管理节点日志、数据库、数据库备份、监控、升级备份大小
   */
  _getManagementNode = async zoneUuid => {
    const { result: resp = [] }: GetManagementNodeDirCapacityResult =
      await this.getManagementNodeDirCapacityAction.call({})

    const result = {
      total: 0,
      used: 0,
      available: 0,
      log: 0,
      database: 0,
      databaseBackup: 0,
      monitor: 0,
      upgradeBackup: 0
    }

    Object.keys(resp).map(key => {
      const objList = resp[key]
      objList.map(obj => {
        if (+obj.size > 0) {
          switch (obj.name) {
            case 'mnLog':
              result.log += +obj.size
              break
            case 'mysql':
              result.database += +obj.size
              break
            case 'mysqlBackup':
              result.databaseBackup += +obj.size
              break
            case 'prometheus':
            case 'influxDB':
              result.monitor += +obj.size
              break
            case 'upgradeBackup':
              result.upgradeBackup += +obj.size
              break
            case 'used':
              result.used += +obj.size
              break
            case 'total':
              result.total += +obj.size
              break
            default:
              break
          }
        }
      })
    })

    result.available = result.total - result.used

    return result
  }

  getCapacityManagementCard = async zoneUuid => {
    return {
      zoneUuid
    }
  }

  getCapacityManagementCardPrimaryStorage = async (zoneUuid, type) => {
    return {
      zoneUuid,
      type
    }
  }

  getCapacityManagementTopListHost = async (
    zoneUuid: string,
    sortBy = 'DiskAllUsedCapacityInPercent',
    sortDirection = 'top'
  ) => {
    const zqlObject = {
      tableName: 'Host',
      fields: ['uuid', 'name'],
      condition: {
        zoneUuid: zoneUuid,
        hypervisorType: {
          [ZOp.ne]: 'ESX'
        }
      },
      returnWith: {
        total: true,
        zwatch: [
          {
            resultName: 'zwatch1',
            metricName: sortBy,
            offsetAheadOfCurrentTime: 1,
            period: 10,
            functions: [`${sortDirection}(num=10)`]
          },
          {
            resultName: 'zwatch2',
            metricName: 'DiskUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10,
            labels: ['MountPoint=/']
          }
        ]
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [
        {
          inventories: resp0 = [],
          returnWith: { zwatch1: resp1 = [], zwatch2: datasMountedList = [] }
        }
      ]
    } = await this.zqlService.call(zql)

    const result = resp1.map(e => {
      const rootMountPointData = _filter(datasMountedList, {
        labels: { HostUuid: e.labels.HostUuid }
      })
      return {
        uuid: e.labels.HostUuid,
        name: _find(resp0, { uuid: e.labels.HostUuid })?.name,
        rootMountPointUsed: rootMountPointData.length ? rootMountPointData[0].value : 0
      }
    })

    return result
  }

  getCapacityManagementTopListHostDiskInfo = async hostUuid => {
    const zqlObject = {
      tableName: 'Host',
      fields: 'uuid',
      condition: {
        uuid: hostUuid
      },
      returnWith: {
        zwatch: [
          {
            resultName: 'zwatch1',
            metricName: 'DiskCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'zwatch2',
            metricName: 'DiskUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'zwatch3',
            metricName: 'DiskUsedCapacityInPercent',
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
          // inventories: resp0 = [],
          returnWith: { zwatch1: resp1 = [], zwatch2: resp2 = [], zwatch3: resp3 = [] }
        }
      ]
    } = await this.zqlService.call(zql)

    const buffer = {}
    resp1.forEach(e => {
      const key = `${e.labels.DiskDeviceLetter}${e.labels.MountPoint}`
      buffer[key] = {
        key: `${e.labels.DiskDeviceLetter}${e.labels.MountPoint}`,
        diskDeviceLetter: e.labels.DiskDeviceLetter,
        mountPoint: e.labels.MountPoint,
        fSType: e.labels.FSType,
        free: e.value || 0
      }
    })

    resp2.forEach(e => {
      const key = `${e.labels.DiskDeviceLetter}${e.labels.MountPoint}`
      buffer[key] = {
        ...buffer[key],
        used: e.value || 0,
        total: e.value + buffer[key].free || 0
      }
    })

    resp3.forEach(e => {
      const key = `${e.labels.DiskDeviceLetter}${e.labels.MountPoint}`
      buffer[key] = {
        ...buffer[key],
        percent: e.value || 0
      }
    })

    const result = []
    Object.keys(buffer).map(e => {
      result.push(buffer[e])
    })

    return result
  }

  getCapacityManagementTopListPrimaryStorage = async (
    zoneUuid: string,
    sortBy = 'UsedPhysicalCapacityInPercent',
    sortDirection = 'top'
  ) => {
    const zqlObject = {
      tableName: 'primaryStorage',
      fields: ['uuid', 'name'],
      condition: {
        zoneUuid: zoneUuid,
        type: {
          [ZOp.in]: ['LocalStorage', 'Ceph', 'SharedBlock']
        }
      },
      returnWith: {
        total: true,
        zwatch: [
          {
            metricName: sortBy,
            offsetAheadOfCurrentTime: 1,
            period: 10,
            functions: [`${sortDirection}(num=10)`]
          }
        ]
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [
        {
          inventories: resp0 = [],
          returnWith: { zwatch: resp1 = [] }
        }
      ]
    } = await this.zqlService.call(zql)

    const result = resp1.map(e => {
      const current = _find(resp0, { uuid: e.labels.PrimaryStorageUuid })
      return {
        uuid: e.labels.PrimaryStorageUuid,
        name: current?.name
      }
    })

    return result
  }

  getCapacityManagementTopListBackupStorage = async (
    zoneUuid: string,
    sortBy = 'UsedCapacityInPercent',
    sortDirection = 'top'
  ) => {
    if (sortBy === 'UsedCapacityInPercent' || sortBy === 'UsedCapacityInBytes') {
      const zqlObject = {
        tableName: 'BackupStorage',
        fields: ['uuid', 'name', 'type'],
        condition: {
          'zone.uuid': zoneUuid,
          type: {
            [ZOp.in]: ['ImageStoreBackupStorage', 'Ceph']
          },
          __systemTag__: {
            [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          }
        },
        returnWith: {
          total: true,
          zwatch: [
            {
              metricName: sortBy,
              offsetAheadOfCurrentTime: 1,
              period: 10,
              functions: [`${sortDirection}(num=10)`]
            }
          ]
        }
      }
      const zql = ZQL.stringify(zqlObject)
      const {
        results: [
          {
            inventories: resp0 = [],
            returnWith: { zwatch: resp1 = [] }
          }
        ]
      } = await this.zqlService.call(zql)

      const result = resp1.map(e => {
        const current = _find(resp0, { uuid: e.labels.BackupStorageUuid })
        return {
          uuid: e.labels.BackupStorageUuid,
          name: current?.name,
          type: current?.type
        }
      })
      return result
    } else {
      const zqlObject = {
        tableName: 'BackupStorage',
        fields: ['uuid', 'name'],
        condition: {
          'zone.uuid': zoneUuid,
          type: {
            [ZOp.in]: ['ImageStoreBackupStorage', 'Ceph']
          },
          __systemTag__: {
            [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          }
        },
        orderBy: sortBy,
        orderDirection:
          sortDirection === 'top'
            ? ('desc' as SortDirectionValidValues)
            : ('asc' as SortDirectionValidValues),
        limit: 10
      }
      const zql = ZQL.stringify(zqlObject)
      const {
        results: [{ inventories: resp = [] }]
      } = await this.zqlService.call(zql)

      const result = resp.map(e => {
        return {
          uuid: e.uuid,
          name: e?.name,
          type: e?.type
        }
      })

      return result
    }
  }

  getCapacityManagementTopListImage = async (
    zoneUuid: string,
    sortBy = 'actualSize',
    sortDirection = 'desc'
  ) => {
    const zqlObject = {
      tableName: 'Image',
      fields: ['uuid', 'name', 'actualSize', 'size', 'system'],
      condition: {
        'backupStorage.zone.uuid': zoneUuid,
        // 'backupStorage.type': {
        //   [ZOp.in]: ['ImageStoreBackupStorage', 'Ceph']
        // },
        'backupStorage.__systemTag__': {
          [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
        },
        format: {
          [ZOp.ne]: 'vmtx'
        },
        type: 'zstack'
      },
      orderBy: sortBy,
      orderDirection: sortDirection as SortDirectionValidValues,
      limit: 10
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)

    const result = resp.map(e => {
      return {
        uuid: e.uuid,
        name: e?.name,
        actualSize: e?.actualSize,
        size: e?.size,
        system: e?.system
      }
    })

    return result
  }

  getCapacityManagementTopListVmInstance = async (
    zoneUuid: string,
    sortBy = 'actualSize',
    sortDirection = 'desc'
  ) => {
    const zqlObject = {
      tableName: 'Volume',
      fields: ['uuid', 'vmInstanceUuid', 'actualSize', 'size'],
      condition: {
        type: 'Root',
        vmInstanceUuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'VmInstance',
              fields: 'uuid',
              condition: {
                type: 'UserVm',
                hypervisorType: {
                  [ZOp.ne]: 'ESX'
                },
                zoneUuid: zoneUuid
              }
            }
          }
        }
      },
      orderBy: sortBy,
      orderDirection: sortDirection as SortDirectionValidValues,
      limit: 10
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)

    const result = resp.map(e => {
      return {
        uuid: e.vmInstanceUuid,
        actualSize: e?.actualSize,
        size: e?.size
      }
    })

    return result
  }

  getCapacityManagementTopListVolume = async (
    zoneUuid: string,
    sortBy = 'actualSize',
    sortDirection = 'desc'
  ) => {
    const zqlObject = {
      tableName: 'Volume',
      fields: ['uuid', 'name', 'actualSize', 'size'],
      condition: {
        type: 'Data',
        format: {
          [ZOp.ne]: 'vmtx'
        },
        'primaryStorage.zone.uuid': zoneUuid
      },
      orderBy: sortBy,
      orderDirection: sortDirection as SortDirectionValidValues,
      limit: 10
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)

    const result = resp.map(e => {
      return {
        uuid: e.uuid,
        name: e?.name,
        actualSize: e?.actualSize,
        size: e?.size
      }
    })

    return result
  }

  getCapacityManagementTopListSnapshot = async (
    zoneUuid: string,
    sortBy = 'size',
    sortDirection = 'desc'
  ) => {
    const zqlObject = {
      tableName: 'VolumeSnapshot',
      fields: ['uuid', 'name', 'size', 'volumeUuid', 'volumeType'],
      condition: {
        'primaryStorage.zoneUuid': zoneUuid
      },
      orderBy: sortBy,
      orderDirection: sortDirection as SortDirectionValidValues,
      limit: 10
    }
    const zql = ZQL.stringify(zqlObject)
    const {
      results: [{ inventories: resp = [] }]
    } = await this.zqlService.call(zql)

    const result = resp.map(e => {
      return {
        uuid: e.uuid,
        name: e?.name,
        size: e?.size,
        volumeUuid: e?.volumeUuid,
        volumeType: e?.volumeType
      }
    })

    return result
  }

  getCapacityManagementDisconnectedResourceCount = async (zoneUuid: string) => {
    const zqlObjects = [
      {
        action: ZQLAction.COUNT,
        tableName: 'Host',
        condition: {
          status: {
            [ZOp.ne]: 'Connected'
          },
          hypervisorType: {
            [ZOp.ne]: 'ESX'
          },
          zoneUuid: zoneUuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'PrimaryStorage',
        condition: {
          status: {
            [ZOp.ne]: 'Connected'
          },
          type: {
            [ZOp.in]: ['LocalStorage', 'Ceph', 'SharedBlock']
          },
          zoneUuid: zoneUuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'BackupStorage',
        condition: {
          status: {
            [ZOp.ne]: 'Connected'
          },
          type: {
            [ZOp.in]: ['ImageStoreBackupStorage', 'Ceph']
          },
          __systemTag__: {
            [ZOp.notIn]: ['remote', 'aliyun', 'onlybackup', 'remotebackup']
          },
          'zone.uuid': zoneUuid
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'PrimaryStorage',
        condition: {
          status: 'Connected',
          type: {
            [ZOp.in]: ['LocalStorage']
          },
          zoneUuid: zoneUuid,
          uuid: {
            [ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'primaryStorageClusterRef',
                fields: 'primaryStorageUuid'
              }
            }
          }
        }
      }
    ]
    const zql = ZQL.multStringify(zqlObjects)
    const {
      results: [
        { total: resp1 = 0 },
        { total: resp2 = 0 },
        { total: resp3 = 0 },
        { total: resp4 = 0 }
      ]
    } = await this.zqlService.call(zql)
    const result = {
      host: resp1,
      primaryStorage: resp2,
      backupStorage: resp3,
      primaryStorageNotInCluster: resp4,
      total: resp1 + resp2 + resp3 + resp4
    }

    return result
  }

  getCapacityManagementListVMDiskInfo = async vmUuid => {
    const zqlQuery = {
      tableName: 'vmInstance',
      fields: ['uuid'],
      condition: { uuid: vmUuid },
      returnWith: {
        zwatch: [
          {
            resultName: 'freeMetrics',
            metricName: 'DiskFreeCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'usedMetrics',
            metricName: 'DiskUsedCapacityInBytes',
            offsetAheadOfCurrentTime: 1,
            period: 10
          },
          {
            resultName: 'percentMetrics',
            metricName: 'DiskUsedCapacityInPercent',
            offsetAheadOfCurrentTime: 1,
            period: 10
          }
        ]
      }
    }

    const zql = ZQL.stringify(zqlQuery)

    const {
      results: [firstResult = {}]
    } = (await this.zqlService.call(zql)) || {}
    const { returnWith = {} } = firstResult
    const {
      freeMetrics: freeData = [],
      usedMetrics: usedData = [],
      percentMetrics: percentData = []
    } = returnWith

    const diskMap = new Map()

    freeData.forEach(metric => {
      const { labels = {}, value = 0 } = metric
      const key = `${labels.DiskDeviceLetter}${labels.MountPoint}`

      if (!diskMap.has(key)) {
        diskMap.set(key, {
          key,
          diskDeviceLetter: labels.DiskDeviceLetter || '',
          mountPoint: labels.MountPoint || '',
          fSType: labels.FSType || '',
          free: value,
          used: 0,
          total: value,
          percent: 0
        })
      } else {
        diskMap.get(key).free = value
      }
    })

    usedData.forEach(metric => {
      const { labels = {}, value = 0 } = metric
      const key = `${labels.DiskDeviceLetter}${labels.MountPoint}`

      if (!diskMap.has(key)) {
        diskMap.set(key, {
          key,
          diskDeviceLetter: labels.DiskDeviceLetter || '',
          mountPoint: labels.MountPoint || '',
          fSType: labels.FSType || '',
          free: 0,
          used: value,
          total: value,
          percent: 0
        })
      } else {
        const disk = diskMap.get(key)
        disk.used = value

        disk.total = disk.free + value
      }
    })

    percentData.forEach(metric => {
      const { labels = {}, value = 0 } = metric
      const key = `${labels.DiskDeviceLetter}${labels.MountPoint}`

      if (!diskMap.has(key)) {
        diskMap.set(key, {
          key,
          diskDeviceLetter: labels.DiskDeviceLetter || '',
          mountPoint: labels.MountPoint || '',
          fSType: labels.FSType || '',
          free: 0,
          used: 0,
          total: 0,
          percent: value
        })
      } else {
        diskMap.get(key).percent = value
      }
    })

    const diskList = Array.from(diskMap.values())

    return {
      list: diskList,
      total: diskList.length
    }
  }
}
