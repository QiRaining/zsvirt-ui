import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  compact as _compact,
  get as _get,
  map as _map,
  pick as _pick,
  reduce as _reduce
} from 'lodash'

import { conditionsToObject, extractAndRemoveExtraCondition } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeDiskOfferingStateAction } from '@/api/zstack/ChangeDiskOfferingStateAction'
import { CreateDiskOfferingAction } from '@/api/zstack/CreateDiskOfferingAction'
import { DeleteDiskOfferingAction } from '@/api/zstack/DeleteDiskOfferingAction'
import { GetAccessPathAction } from '@/api/zstack/GetAccessPathAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { QueryVmInstanceAction } from '@/api/zstack/QueryVmInstanceAction'
import { RevokeResourceSharingAction } from '@/api/zstack/RevokeResourceSharingAction'
import { ShareResourceAction } from '@/api/zstack/ShareResourceAction'
import { UpdateDiskOfferingAction } from '@/api/zstack/UpdateDiskOfferingAction'
import { ValidateDiskOfferingUserConfigAction } from '@/api/zstack/ValidateDiskOfferingUserConfigAction'
import {
  Condition as ICondition,
  QueryAction as IQueryAction
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'
import { ZsvSharedResourceQueryService } from '@/zsphere-administration/owner/zsv-shared-resource-query'

import {
  QueryVmTemplateArgs,
  VmTemplate,
  VmTemplateQueryResp,
  VmTemplateQueryType
} from '../vm-template.model'

@Injectable()
export class VmTemplateService {
  @Inject() zqlService: ZQLService
  @Inject() queryVmInstance: QueryVmInstanceAction
  @Inject() createDiskOfferingAction: CreateDiskOfferingAction
  @Inject() getAccessPathAction: GetAccessPathAction
  @Inject() deleteDiskofferingAction: DeleteDiskOfferingAction
  @Inject() changeDiskOfferingStateAction: ChangeDiskOfferingStateAction
  @Inject() updateDiskOfferingAction: UpdateDiskOfferingAction
  @Inject() shareResourceAction: ShareResourceAction
  @Inject() zsvSharedResourceQueryService: ZsvSharedResourceQueryService
  @Inject() revokeResourceAction: RevokeResourceSharingAction
  @Inject() querySystemTagsAction: QuerySystemTagAction

  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject()
  validateDiskOfferingUserConfigAction: ValidateDiskOfferingUserConfigAction

  private vmInstanceDataLoader

  constructor() {
    this.vmInstanceDataLoader = new DataLoader(this._getVmInstance)
  }

  async query(params: QueryVmTemplateArgs): Promise<VmTemplateQueryResp> {
    const { type = VmTemplateQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null

    switch (type) {
      case VmTemplateQueryType.NORMAL:
        break
      case VmTemplateQueryType.ZSV_SHARED_RESOURCE:
        _extrazqlConditions = await this.zsvSharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'VmInstanceVO' //vmtemplate 实际还是 vm
        )
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getVmTemplateList(params, zqlCondition)

    return _resultResp
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

  async getVmTemplateList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'templatedVminstance',
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
    const VmTemplateList = results?.[0]?.inventories ?? []

    const resultWithVM = (await Promise.all(
      VmTemplateList.map(t => {
        return this.queryVmInstance.call({
          conditions: [{ key: 'uuid', value: t.uuid }]
        })
      })
    )) as any

    const resultList = VmTemplateList.map((t: VmTemplate) => {
      return {
        ...t,
        vm: resultWithVM.find((vm: any) => vm?.inventories?.[0]?.uuid === t.uuid)
          ?.inventories?.[0] as any
      }
    })

    const total = results?.[0]?.total ?? 0

    return {
      list: resultList,
      total: total
    }
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition = []
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'volumeUuid',
      'vmInstanceUuid',
      'shareType'
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

    if (_extraConditionMap['shareType']) {
      const shareType = _extraConditionMap['shareType'].values
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(shareType, 'VmInstanceVO')
      )
    }

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async queryByUuid(uuid: string) {
    const zql = ZQL.stringify({
      tableName: 'templatedVminstance',
      condition: this.buildZqlCondition([{ key: 'uuid', value: uuid }], []),
      action: ZQLAction.QUERY
    })

    const vmTemplateResp = await this.zqlService.call(zql)

    const result = vmTemplateResp.results?.[0]?.inventories?.[0]

    const resultWithVM = await this.queryVmInstance.call({
      conditions: [{ key: 'uuid', value: result?.uuid }]
    })

    return {
      ...result,
      vm: { ...resultWithVM.inventories?.[0] }
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
}
