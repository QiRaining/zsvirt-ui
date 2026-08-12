import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import { uniq, compact, keyBy } from 'lodash'

import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql/index'

import { VmInstanceQueryService } from './vm-instance-query/vm-instance-query.service'

@Injectable()
export class VmInstanceDataloader {
  @Inject() apiQueryVmInstanceService: QueryVmInstanceAction
  @Inject() zqlService: ZQLService

  private vmInstanceDataLoader
  private templatedVmInstanceDataLoader
  private vmOrTemplateDataLoader

  constructor() {
    this.vmInstanceDataLoader = new DataLoader(this._query)
    this.templatedVmInstanceDataLoader = new DataLoader(this._queryTemplatedVmInstance)
    this.vmOrTemplateDataLoader = new DataLoader(this._queryVmOrTemplate)
  }

  query(_id: any, vmInstanceUuid: string) {
    if (!vmInstanceUuid) {
      return null
    }
    return this.vmInstanceDataLoader.load(vmInstanceUuid)
  }

  _query = async (uuids: string[]) => {
    const uniqUuids = compact(uniq(uuids))
    const resp = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'VmInstance',
        condition: {
          [ZOp.and]: [
            {
              uuid: {
                [ZOp.in]: uniqUuids
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstance',
                    fields: ['uuid'],
                    condition: {
                      uuid: {
                        [ZOp.in]: uniqUuids
                      }
                    }
                  }
                }
              }
            },
            {
              uuid: {
                [ZOp.notIn]: {
                  [ZOp.query]: {
                    tableName: 'TemplatedVmInstanceCache',
                    fields: ['cacheVmInstanceUuid'],
                    condition: {
                      cacheVmInstanceUuid: {
                        [ZOp.in]: uniqUuids
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      })
    )
    const list = resp?.results?.[0]?.inventories ?? []
    const map = keyBy(list, 'uuid')
    return uuids.map(uuid => map[uuid] || null)
  }

  queryVmOrTemplate(lastVmInstanceUuid: string) {
    if (!lastVmInstanceUuid) {
      return null
    }
    return this.vmOrTemplateDataLoader.load(lastVmInstanceUuid)
  }

  _queryVmOrTemplate = async (uuids: string[]) => {
    const uniqUuids = compact(uniq(uuids))
    const resp = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'VmInstance',
        condition: {
          uuid: {
            [ZOp.in]: uniqUuids
          }
        }
      })
    )
    const list = resp?.results?.[0]?.inventories ?? []
    const map = keyBy(list, 'uuid')
    return uuids.map(uuid => map[uuid] || null)
  }

  queryTemplatedVmInstance(uuid: string) {
    if (!uuid) {
      return null
    }
    return this.templatedVmInstanceDataLoader.load(uuid)
  }

  _queryTemplatedVmInstance = async (uuids: string[]) => {
    const uniqUuids = compact(uniq(uuids))
    const resp = await this.zqlService.call(
      ZQL.stringify({
        tableName: 'VmInstance',
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'TemplatedVmInstance',
                fields: ['uuid'],
                condition: {
                  uuid: {
                    [ZOp.in]: uniqUuids
                  }
                }
              }
            }
          }
        }
      })
    )
    const list = resp?.results?.[0]?.inventories ?? []
    const map = keyBy(list, 'uuid')
    return uuids.map(uuid => map[uuid] || null)
  }
}

@Injectable()
export class VmInstanceByVolumeDataloader {
  @Inject() _action: QueryVmInstanceAction
  @Inject() zqlService: ZQLService
  private _loader: any

  private _maper: any = {}

  constructor() {
    this._loader = new DataLoader(this._query)
  }
  query(uuid, rootVolumeUuid) {
    this._maper[uuid] = {
      uuid,
      rootVolumeUuid
    }
    return this._loader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const rootVolumeUuids = uuids.map(uuid => this._maper[uuid].rootVolumeUuid)
    //for filter templatedvm
    const zqlObject = {
      tableName: 'vmInstance',
      condition: {
        rootVolumeUuid: { [ZOp.in]: rootVolumeUuids },
        uuid: {
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
      },
      action: ZQLAction.QUERY,
      returnWith: {
        total: true
      },
      start: 0,
      limit: 1000
    }
    const zql = ZQL.stringify(zqlObject)

    const resp = await this.zqlService.call(zql)

    //const resp = await this._action.call(params)

    return uuids.map(uuid => {
      const result = resp.results?.[0]?.inventories.find(
        vmInstance => vmInstance.rootVolumeUuid === this._maper[uuid].rootVolumeUuid
      )
      return result || null
    })
  }
}

@Injectable()
export class VmInstanceByNotRootVolumeDataloader {
  @Inject() _action: QueryVmInstanceAction

  private _loader: any

  private _maper: any = {}

  constructor() {
    this._loader = new DataLoader(this._query)
  }
  query(uuid, volumeUuid) {
    this._maper[uuid] = {
      uuid,
      volumeUuid
    }
    return this._loader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const volumeUuids = uuids.map(uuid => this._maper[uuid].volumeUuid)
    const params: QueryParam = {
      conditions: [
        { key: 'allVolumes.uuid', op: Op.in, values: volumeUuids },
        { key: 'rootVolumeUuid', op: Op.notIn, values: volumeUuids }
      ],
      start: 0,
      limit: 1000
    }
    const resp = await this._action.call(params)
    return uuids.map(uuid => {
      const result = resp.inventories.find(vmInstance => {
        const findObj = vmInstance.allVolumes.find(
          item => item.uuid === this._maper[uuid].volumeUuid
        )

        return !!findObj
      })
      return result
    })
  }
}

@Injectable()
export class VmInstanceExportDataloader {
  @Inject() vmInstanceQueryService: VmInstanceQueryService

  private vmInstanceExportDataloader
  private exportMap: any = {}

  constructor() {
    this.vmInstanceExportDataloader = new DataLoader(this._query)
  }

  query(uuid, VmUuid) {
    this.exportMap[uuid] = {
      uuid,
      VmUuid
    }
    return this.vmInstanceExportDataloader.load(uuid)
  }

  _query = async (uuids: string[]) => {
    const params = {
      conditions: [{ key: 'vmUuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const results = await this.vmInstanceQueryService.getOvfExportList(params)
    const exportVms = results?.list

    return uuids.map(uuid => {
      const exportVm = exportVms.find(vm => vm.vmUuid === uuid)
      if (exportVm) {
        return exportVm
      } else {
        return null
      }
    })
  }
}
