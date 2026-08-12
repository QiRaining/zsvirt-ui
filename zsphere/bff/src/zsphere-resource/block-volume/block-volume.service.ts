import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  compact as _compact,
  get as _get,
  map as _map,
  pick as _pick,
  reduce as _reduce
} from 'lodash'

import {
  QueryParam,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeDiskOfferingStateAction } from '@/api/zstack/ChangeDiskOfferingStateAction'
import { CreateDiskOfferingAction } from '@/api/zstack/CreateDiskOfferingAction'
import { DeleteDiskOfferingAction } from '@/api/zstack/DeleteDiskOfferingAction'
import { GetAccessPathAction } from '@/api/zstack/GetAccessPathAction'
import { QueryBlockVolumeAction } from '@/api/zstack/QueryBlockVolumeAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryXskyBlockVolumeAction } from '@/api/zstack/QueryXskyBlockVolumeAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { UpdateDiskOfferingAction } from '@/api/zstack/UpdateDiskOfferingAction'
import { ValidateDiskOfferingUserConfigAction } from '@/api/zstack/ValidateDiskOfferingUserConfigAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'

import {
  BlockVolumeQueryResp,
  BlockVolumeQueryType,
  QueryBlockVolumeArgs
} from './block-volume.model'
@Injectable()
export class BlockVolumeService {
  @Inject() zqlService: ZQLService
  @Inject() queryBlockVolumeAction: QueryBlockVolumeAction
  @Inject() queryXskyBlockVolumeAction: QueryXskyBlockVolumeAction
  @Inject() createDiskOfferingAction: CreateDiskOfferingAction
  @Inject() getAccessPathAction: GetAccessPathAction
  @Inject() deleteDiskofferingAction: DeleteDiskOfferingAction
  @Inject() changeDiskOfferingStateAction: ChangeDiskOfferingStateAction
  @Inject() updateDiskOfferingAction: UpdateDiskOfferingAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject() querySystemTagsAction: QuerySystemTagAction
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject()
  validateDiskOfferingUserConfigAction: ValidateDiskOfferingUserConfigAction

  private vmInstanceDataLoader
  private lastvmInstanceDataLoader

  constructor() {
    this.vmInstanceDataLoader = new DataLoader(this._getVmInstance)
    this.lastvmInstanceDataLoader = new DataLoader(this._getLastVmInstance)
  }

  async query(params: QueryBlockVolumeArgs): Promise<BlockVolumeQueryResp> {
    const { type = BlockVolumeQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case BlockVolumeQueryType.NORMAL:
        break
      case BlockVolumeQueryType.BM2Instance:
        _extrazqlConditions = await this.getVolumeByVmInstanceUuid(params.extraConditions)
        break
      case BlockVolumeQueryType.ForBM2InstanceSelect:
        _extrazqlConditions = await this.getVolumeCanBeAttachedToBM2VM(params.extraConditions)
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getBlockVolumeList(params, zqlCondition)

    return _resultResp
  }

  // 获取云主机上面的云盘
  async getVolumeCanBeAttachedToBM2VM(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const isNull = params?.vmInstanceUuid === null || params?.vmInstanceUuid === 'null'
    const zqlCondition = {
      type: {
        [ZOp.ne]: 'Memory'
      },
      [ZOp.or]: {
        vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid,
        uuid: {
          [ZOp.notIn]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: ['volumeUuid'],
              condition: {
                vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid
              }
            }
          }
        }
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }
  // 获取云主机上面的云盘
  async getVolumeByVmInstanceUuid(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const isNull = params?.vmInstanceUuid === null || params?.vmInstanceUuid === 'null'
    const zqlCondition = {
      type: {
        [ZOp.ne]: 'Memory'
      },
      [ZOp.or]: {
        vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid,
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: ['volumeUuid'],
              condition: {
                vmInstanceUuid: isNull ? { [ZOp.is]: null } : params?.vmInstanceUuid
              }
            }
          }
        }
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  async getBlockVolumeList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'XskyBlockVolume',
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
    const blockVolumeList = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: blockVolumeList,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'volumeUuid',
      'vmInstanceUuid'
    ])

    if (_extraConditionMap['volumeUuid']) {
      const volumeUuid = _extraConditionMap['volumeUuid'].value
      const volumeZqlCondition = {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'ShareableVolumeVmInstanceRef',
              fields: ['vmInstanceUuid'],
              condition: {
                volumeUuid: volumeUuid
              }
            }
          }
        }
      }
      specicalCondition.push(volumeZqlCondition)
    }

    if (_extraConditionMap['vmInstanceUuid'] || _extraConditionMap['vmInstance.uuid']) {
      const vmInstanceUuid =
        _extraConditionMap['vmInstanceUuid']?.value ??
        _extraConditionMap['vmInstance.uuid']?.value ??
        null
      const isNull = vmInstanceUuid === null || vmInstanceUuid === 'null'
      const vmZqlCondition = {
        [ZOp.or]: {
          vmInstanceUuid: isNull ? { [ZOp.is]: null } : vmInstanceUuid,
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'ShareableVolumeVmInstanceRef',
                fields: ['volumeUuid'],
                condition: {
                  vmInstanceUuid: isNull ? { [ZOp.is]: null } : vmInstanceUuid
                }
              }
            }
          }
        }
      }
      specicalCondition.push(vmZqlCondition)
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async queryByUuid(uuid: string) {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }

    const { inventories } = await this.queryXskyBlockVolumeAction.call(params)

    return _get(inventories, ['0'], null)
  }

  async getAccessPath(uuid: string) {
    const { pathInfos } = await this.getAccessPathAction.call({
      primaryStorageUuid: uuid
    })

    return {
      list: pathInfos
    }
  }

  getVmInstance(uuid) {
    return this.vmInstanceDataLoader.load(uuid)
  }

  _getVmInstance = async (uuids: string[]) => {
    const multVmZql = _map(uuids, uuid => {
      return {
        tableName: 'VmInstance',
        condition: {
          [ZOp.or]: {
            'allVolumes.uuid': uuid,
            uuid: {
              [ZOp.in]: {
                [ZOp.query]: {
                  tableName: 'ShareableVolumeVmInstanceRef',
                  fields: ['vmInstanceUuid'],
                  condition: {
                    volumeUuid: uuid
                  }
                }
              }
            }
          }
        },
        namedAs: uuid
      }
    })
    const zql = ZQL.multStringify(multVmZql)
    const { results } = await this.zqlService.call(zql)
    const vmMap = _reduce(
      results,
      (obj, it) => {
        obj[it.name] = _get(it, 'inventories')
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const vmInstanceList = _get(vmMap, uuid)
      if (vmInstanceList) {
        return vmInstanceList
      } else {
        return []
      }
    })
  }

  getLastVmInstance(uuid) {
    return this.lastvmInstanceDataLoader.load(uuid)
  }

  _getLastVmInstance = async (uuids: string[]) => {
    const lastVmZql = {
      tableName: 'VmInstance',
      condition: {
        lastVmInstanceUuid: {
          [ZOp.in]: uuids
        },
        vmInstanceUuid: {
          [ZOp.is]: null
        }
      }
    }
    const zql = ZQL.stringify(lastVmZql)
    const { results } = await this.zqlService.call(zql)
    const lastVmList = _get(results, ['0', 'inventories'], [])
    const vmMap = _reduce(
      lastVmList,
      (obj, it) => {
        obj[it.uuid] = it
        return obj
      },
      {}
    )
    return uuids.map(uuid => _get(vmMap, uuid, null))
  }
}
