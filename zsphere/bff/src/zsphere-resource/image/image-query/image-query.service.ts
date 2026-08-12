import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  compact as _compact,
  find as _find,
  get as _get,
  pick as _pick,
  reduce as _reduce,
  remove as _remove,
  set as _set,
  split as _split,
  uniq as _uniq
} from 'lodash'

import {
  Op,
  QueryParam,
  conditionsToObject,
  extractAndRemoveExtraCondition
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetBareMetal2SupportedBootModeAction } from '@/api/zstack/GetBareMetal2SupportedBootModeAction'
import { GetImageQgaAction } from '@/api/zstack/GetImageQgaAction'
import {
  GetInterdependentL3NetworksImagesAction,
  GetInterdependentL3NetworksImagesActionParam as IGetInterdependentL3NetworksImagesActionParam
} from '@/api/zstack/GetInterdependentL3NetworksImagesAction'
import { GetManagementNodeArchAction } from '@/api/zstack/GetManagementNodeArchAction'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { QueryBackupStorageAction } from '@/api/zstack/QueryBackupStorageAction'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { QueryImageAction } from '@/api/zstack/QueryImageAction'
import { ImageInventory } from '@/api/zstack/types'
import {
  Condition as ICondition,
  QueryAction as IQueryAction,
  SortDirectionValidValues
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp, ZQLAction } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { SharedResourceQueryService } from '@/zsphere-administration/owner/shared-resource-query'
import { ZsvSharedResourceQueryService } from '@/zsphere-administration/owner/zsv-shared-resource-query'

import {
  CpuMemHotAdd,
  GuestOsCpuMemHotAddInfoList,
  ImageQueryType,
  ManagementNodeArch
} from '../image.model'
import { HotAddInfo } from './hot-add-info'

type IHotAddInfo = (typeof HotAddInfo)[number]

@Injectable()
export class ImageQueryService {
  @Inject() zqlService: ZQLService
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() queryImageAction: QueryImageAction
  @Inject()
  getInterdependentL3NetworksImagesAction: GetInterdependentL3NetworksImagesAction
  @Inject() getImageQgaAction: GetImageQgaAction
  @Inject() sharedResourceQueryService: SharedResourceQueryService
  @Inject() zsvSharedResourceQueryService: ZsvSharedResourceQueryService
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction
  @Inject() getManagementNodeArchAction: GetManagementNodeArchAction
  @Inject()
  getBareMetal2SupportedBootModeAction: GetBareMetal2SupportedBootModeAction
  @Inject()
  queryBackupStorageAction: QueryBackupStorageAction

  private backupStorageDataLoader
  private ownerDataLoader
  private bootModeDataLoader
  private QGADataLoader
  private useForDataloader
  private baremetal2ImageDataLoader
  private availableUserVmDataLoader
  private zmigrateImageDataLoader

  private imageBackupStorageMap: any = {}

  constructor() {
    this.backupStorageDataLoader = new DataLoader(this._getBackupStorage)
    this.ownerDataLoader = new DataLoader(this._getOwner)
    this.bootModeDataLoader = new DataLoader(this._getBootMode)
    this.QGADataLoader = new DataLoader(this._getQGA)
    this.baremetal2ImageDataLoader = new DataLoader(this._getIsBaremetal2Image)
    this.useForDataloader = new DataLoader(this._getUseFor)
    this.availableUserVmDataLoader = new DataLoader(this._getAvailableUserVm)
    this.zmigrateImageDataLoader = new DataLoader(this._getIsZmigrateImage)
  }

  async queryByUuid(uuid: string): Promise<ImageInventory> {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.queryImageAction.call(params)
    return _get(inventories, ['0'], null)
  }

  async queryList(params: IQueryAction) {
    const { type = ImageQueryType.NORMAL } = params

    let _extrazqlConditions
    let _resultResp = null
    let finalConditions: ICondition[] = []

    switch (type) {
      case ImageQueryType.NORMAL:
        break

      // GetCandidateIsoForAttachingVm
      case ImageQueryType.GET_CANDIDATE_ISO_FOR_ATTACHING_VM:
        _extrazqlConditions = await this.getCandidateIsoForAttachingVm(params.extraConditions)
        break

      // 获取云主机可以卸载的ISO
      case ImageQueryType.GET_DETACHABLE_ISO_FROM_VM:
        _extrazqlConditions = await this.getDetachableIsoFromVm(params.extraConditions)
        break

      // 通过PS获取可以用来创建云主机的镜像
      case ImageQueryType.GetCandidateImagesForCreatingVm:
        _extrazqlConditions = await this.getCandidateImagesForCreatingVm(params.extraConditions)
        break

      // GetImageCandidatesForVmToChange
      case ImageQueryType.GET_IMAGE_CANDIDATES_FOR_VM_TO_CHANGE:
        _extrazqlConditions = await this.getImageCandidatesForVmToChange(params.extraConditions)
        break
      case ImageQueryType.GET_IMAGE_CANDIDATES_FOR_AUTO_SCALING_GROUP:
        const extraConditions = JSON.parse(JSON.stringify(params.extraConditions)) || []
        params.extraConditions?.map(({ key, value }) => {
          if (key === 'l3NetworkUuid') {
            extraConditions.push({
              key: 'l3NetworkUuids',
              values: [value],
              op: Op.in
            })
          }
        })
        finalConditions = await this.getImageCandidatesForAutoScalingGroup(extraConditions)
        break
      case ImageQueryType.SHARED_RESOURCE:
        _extrazqlConditions = await this.sharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'ImageVO'
        )
        break
      case ImageQueryType.ZSV_SHARED_RESOURCE:
        _extrazqlConditions = await this.zsvSharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'ImageVO'
        )
        break
      case ImageQueryType.ZSV_NOT_SHARED_RESOURCE:
        _extrazqlConditions = await this.zsvSharedResourceQueryService.getSharedResourceList(
          params.extraConditions,
          'ImageVO',
          false
        )
        break
      case ImageQueryType.MINE_RESOURCE:
        _extrazqlConditions = {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'accountResourceRef',
                fields: 'resourceUuid',
                condition: {
                  accountUuid: conditionsToObject(params.extraConditions)['accountUuid'],
                  resourceType: 'ImageVO'
                }
              }
            }
          }
        }
        break

      // 混合云上传镜像
      case ImageQueryType.GET_IMAGE_CANDIDATES_FOR_HYBRID_IMAGE_UPLOAD:
        _extrazqlConditions = await this.getCreateHybridImageCondition(params)
        break
    }

    const zqlCondition = await this.buildZqlCondition(params.conditions, _extrazqlConditions)

    _resultResp = await this.getImageList(params, zqlCondition)

    return _resultResp
  }

  async getImageList(param: IQueryAction, zqlCondition: ZqlObject['condition']) {
    const zqlObject = {
      tableName: 'Image',
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
    console.log('zql:', zql)
    const { results } = await this.zqlService.call(zql)
    const images = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0
    return {
      list: images,
      total: total
    }
  }

  async buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'ownerName',
      'shareType',

      'guestOsType',
      'baremetal2Image',
      '__bootModeSystemTag__'
    ])

    // 镜像格式表头过滤处理
    const __mediaType__ = conditionsToObject(_conditions)['__mediaType__']
    if (__mediaType__) {
      if (__mediaType__.includes('RootVolumeTemplate')) {
        _conditions.push({
          key: 'mediaType',
          values: __mediaType__.concat(['ISO']),
          op: Op.in
        })
      } else {
        _conditions.push({
          key: 'mediaType',
          values: __mediaType__,
          op: Op.in
        })
      }
      _remove(_conditions, _conditions => _conditions.key === '__mediaType__')
    }

    // 镜像功能表头过滤处理
    const __useFor__ = conditionsToObject(_conditions)['__useFor__']
    if (__useFor__) {
      const values = __useFor__.map(it => `applianceType::${it}`)
      _conditions.push({ key: '__systemTag__', values, op: Op.in })
      _remove(_conditions, _conditions => _conditions.key === '__useFor__')
    }

    const specicalCondition = []
    if (_extraConditionMap['ownerName']) {
      const ownerName = _extraConditionMap['ownerName'].value
      specicalCondition.push(
        QueryConditionTranslator.generateOwnerZqlConditon(ownerName, 'ImageVO')
      )
    }
    if (_extraConditionMap['shareType']) {
      const shareType = _extraConditionMap['shareType'].values
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(shareType, 'ImageVO')
      )
    }

    if (_extraConditionMap['guestOsType']) {
      const guestOsTypeConditions = _extraConditionMap['guestOsType'].values
      const conditions = []
      guestOsTypeConditions?.map(it => {
        conditions.push({
          guestOsType: {
            [ZOp.like]: it
          }
        })
      })
      specicalCondition.push({
        [ZOp.or]: conditions
      })
    }
    if (_extraConditionMap['baremetal2Image']) {
      const baremetal2ImageConditions = _extraConditionMap['baremetal2Image'].values
      if (baremetal2ImageConditions?.length === 1) {
        specicalCondition.push({
          uuid: {
            [baremetal2ImageConditions?.[0] === 'Yes' ? ZOp.in : ZOp.notIn]: {
              [ZOp.query]: {
                tableName: 'SystemTag',
                fields: ['resourceUuid'],
                condition: {
                  resourceType: 'ImageVO',
                  tag: 'baremetal2'
                }
              }
            }
          }
        })
      }
    }
    // 过滤创建弹性裸金属实例时的可用镜像
    if (_extraConditionMap['__bootModeSystemTag__']) {
      const bootModeConditions = _extraConditionMap['__bootModeSystemTag__'].values
      if (bootModeConditions?.length) {
        specicalCondition.push({
          [ZOp.and]: {
            [ZOp.or]: bootModeConditions.map(bootModeSystemTag => ({
              __systemTag__: bootModeSystemTag
            }))
          }
        })
      }
    }
    // if (_extraConditionMap['ownerName']) {
    //   const ownerName = _extraConditionMap['ownerName'].value
    //   const ownerZqlConditon = {
    //     [ZOp.or]: [
    //       {
    //         uuid: {
    //           [ZOp.in]: {
    //             [ZOp.query]: {
    //               tableName: 'AccountResourceRef',
    //               fields: ['resourceUuid'],
    //               condition: {
    //                 resourceType: 'ImageVO',
    //                 accountUuid: {
    //                   [ZOp.in]: {
    //                     [ZOp.query]: {
    //                       tableName: 'account',
    //                       fields: ['uuid'],
    //                       condition: {
    //                         name: {
    //                           [ZOp.like]: ownerName
    //                         }
    //                       }
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //       {
    //         uuid: {
    //           [ZOp.in]: {
    //             [ZOp.query]: {
    //               tableName: 'AccountResourceRef',
    //               fields: ['resourceUuid'],
    //               condition: {
    //                 resourceType: 'ImageVO',
    //                 accountUuid: {
    //                   [ZOp.in]: {
    //                     [ZOp.query]: {
    //                       tableName: 'IAM2ProjectAccountRef',
    //                       fields: 'accountUuid',
    //                       condition: {
    //                         projectUuid: {
    //                           [ZOp.in]: {
    //                             [ZOp.query]: {
    //                               tableName: 'IAM2Project',
    //                               fields: ['uuid'],
    //                               condition: {
    //                                 name: {
    //                                   [ZOp.like]: ownerName
    //                                 }
    //                               }
    //                             }
    //                           }
    //                         }
    //                       }
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     ]
    //   }
    //   specicalCondition.push(ownerZqlConditon)
    // }

    // _conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }

  async getCandidateIsoForAttachingVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)

    const candidateKeys = ['vmInstanceUuid']
    const params = _pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: `getapi(api='GetCandidateIsoForAttachingVm',output='inventories.uuid',vmInstanceUuid='${params?.vmInstanceUuid}')`
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  async getDetachableIsoFromVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const vmInstanceUuid = _get(conditionsMap, 'vmInstanceUuid', '')

    const zqlObject = {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'VmCdRom',
            fields: ['isoUuid'],
            condition: {
              vmInstanceUuid: vmInstanceUuid
            }
          }
        }
      }
    }

    return vmInstanceUuid ? zqlObject : undefined
  }

  // 通过PS获取可以用来创建云主机的镜像
  async getCandidateImagesForCreatingVm(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['primaryStorageUuid']
    const params = _pick(conditionsMap, candidateKeys) as {
      primaryStorageUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: {
          [ZOp.getapi]: {
            action: ZQLAction.GET_API,
            api: 'GetCandidateImagesForCreatingVm',
            output: 'inventories.uuid',
            condition: {
              primaryStorageUuid: `${params?.primaryStorageUuid}`
            }
          }
        }
      }
    }

    return params?.primaryStorageUuid ? zqlCondition : undefined
  }

  async getImageCandidatesForAutoScalingGroup(extraConditions) {
    const conditions: ICondition[] = []
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['zoneUuid', 'l3NetworkUuids']
    const param = _pick(
      conditionsMap,
      candidateKeys
    ) as IGetInterdependentL3NetworksImagesActionParam
    let candidateResp
    try {
      candidateResp = await this.getInterdependentL3NetworksImagesAction.call(param)
    } catch (e) {
      console.log('getInterdependentL3NetworksImagesAction failed:::', e)
    }
    const imageUuidList = candidateResp?.inventories?.map(it => it.uuid) || []
    conditions.push({
      key: 'uuid',
      op: Op.in,
      values: _uniq(imageUuidList)
    })

    return conditions
  }

  async getImageCandidatesForVmToChange(extraConditions) {
    const conditionsMap = conditionsToObject(extraConditions)
    const candidateKeys = ['vmInstanceUuid']
    const params = _pick(conditionsMap, candidateKeys) as {
      vmInstanceUuid: string
    }

    const zqlCondition = {
      uuid: {
        [ZOp.in]: `getapi(api='GetImageCandidatesForVmToChange',output='inventories.uuid',vmInstanceUuid='${params?.vmInstanceUuid}')`
      }
    }

    return params?.vmInstanceUuid ? zqlCondition : undefined
  }

  async getCreateHybridImageCondition(params) {
    const { extraConditions = [] } = params
    const extraConditionsMap = conditionsToObject(extraConditions)
    const platform = extraConditionsMap?.['platform'] ?? 'Linux'

    const zqlObject = {
      type: 'zstack',
      state: 'Enabled',
      system: 'false',
      'backupStorage.type': 'ImageStoreBackupStorage',
      platform: 'Linux'
    }

    if (platform !== 'Linux') {
      _set(zqlObject, 'platform', {
        [ZOp.in]: ['Windows', 'WindowsVirtio']
      })
    }

    return zqlObject
  }

  getOwner(uuid) {
    return this.ownerDataLoader.load(uuid)
  }

  _getOwner = async (uuids: string[]) => {
    const param: GetResourceAccountActionParam = {
      resourceUuids: uuids
    }
    const { inventories: ownerMap } = await this.getResourceAccountAction.call(param)
    return uuids.map(uuid => {
      const owner = _get(ownerMap, uuid)
      if (owner) {
        return owner
      } else {
        return null
      }
    })
  }

  getBackupStorage(uuid, backupStorageUuid) {
    this.imageBackupStorageMap[uuid] = {
      uuid,
      backupStorageUuid
    }
    return this.backupStorageDataLoader.load(uuid)
  }

  _getBackupStorage = async (uuids: string[]) => {
    const imageUuidList: any[] = uuids.map(uuid =>
      _get(this.imageBackupStorageMap, [uuid, 'backupStorageUuid'])
    )
    const zql = ZQL.stringify({
      tableName: 'BackupStorage',
      fields: ['uuid', 'name', 'type'],
      condition: {
        uuid: {
          [ZOp.in]: imageUuidList
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const backupStorages = results?.[0]?.inventories
    const backupStorageMap = _reduce(
      backupStorages,
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const backupStorage = _get(
        backupStorageMap,
        _get(this.imageBackupStorageMap, [uuid, 'backupStorageUuid'])
      )
      if (backupStorage) {
        return backupStorage
      } else {
        return null
      }
    })
  }

  getBootMode(uuid) {
    return this.bootModeDataLoader.load(uuid)
  }

  _getBootMode = async (uuids: string[]) => {
    const imageUuidList: any[] = uuids
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceUuid: {
          [ZOp.in]: imageUuidList
        },
        resourceType: 'ImageVO',
        tag: {
          [ZOp.like]: 'bootMode::'
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const systemTags = results?.[0]?.inventories
    const systemTagMap = _reduce(
      systemTags,
      (obj, item) => {
        obj[item.resourceUuid] = _get(_split(item.tag, '::'), '1')
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      const bootMode = _get(systemTagMap, uuid, 'Legacy')
      return bootMode
    })
  }

  getUseFor = uuid => {
    return this.useForDataloader.load(uuid)
  }

  _getUseFor = async (uuids: string[]) => {
    const imageUuidList: any[] = uuids
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceUuid: {
          [ZOp.in]: imageUuidList
        },
        resourceType: 'ImageVO',
        tag: {
          [ZOp.like]: 'applianceType::'
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const systemTags = results?.[0]?.inventories
    const systemTagMap = _reduce(
      systemTags,
      (obj, item) => {
        obj[item.resourceUuid] = _get(_split(item.tag, '::'), '1')
        return obj
      },
      {}
    )
    return uuids.map(uuid => {
      let useFor = _get(systemTagMap, uuid, 'applianceType')
      if (useFor === 'applianceType') {
        useFor = null
      }
      return useFor
    })
  }

  getQGA(uuid) {
    return this.QGADataLoader.load(uuid)
  }

  _getQGA = async (uuids: string[]) => {
    return uuids.map(async uuid => {
      const { enable } = await this.getImageQgaAction.call({ uuid })
      return enable
    })
  }

  async queryImageSupportBootModeForBareMetal2Instance() {
    const { supportedBootMode } = await this.getBareMetal2SupportedBootModeAction.call({})
    return supportedBootMode?.split(',')
  }

  getAvailableUserVm(uuid) {
    return this.availableUserVmDataLoader.load(uuid)
  }

  _getAvailableUserVm = async (uuids: string[]) => {
    const imageUuidList: any[] = uuids
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'VmInstance',
      groupBy: 'imageUuid',
      condition: {
        imageUuid: {
          [ZOp.in]: _uniq(imageUuidList)
        },
        state: {
          [ZOp.ne]: 'Destroyed'
        },
        type: 'UserVm'
      }
    })
    const { results } = await this.zqlService.call(zql)
    const inventoryCounts = results?.[0]?.inventoryCounts || []

    const vmInstanceMap = _reduce(
      inventoryCounts,
      (obj, item) => {
        const [{ imageUuid }, total] = item
        obj[imageUuid] = total
        return obj
      },
      {}
    )
    return uuids.map(uuid => _get(vmInstanceMap, uuid, 0))
  }

  getIsBaremetal2Image(uuid) {
    return this.baremetal2ImageDataLoader.load(uuid)
  }

  _getIsBaremetal2Image = async (uuids: string[]) => {
    const imageUuidList: any[] = uuids
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceUuid: {
          [ZOp.in]: _uniq(imageUuidList)
        },
        resourceType: 'ImageVO',
        tag: 'baremetal2'
      }
    })
    const { results } = await this.zqlService.call(zql)
    const systemTags = results?.[0]?.inventories
    const systemTagMap = _reduce(
      systemTags,
      (obj, item) => {
        obj[item.resourceUuid] = true
        return obj
      },
      {}
    )
    return uuids.map(uuid => _get(systemTagMap, uuid, false))
  }

  getIsZmigrateImage(uuid) {
    return this.zmigrateImageDataLoader.load(uuid)
  }

  _getIsZmigrateImage = async (uuids: readonly string[]) => {
    const zql = ZQL.stringify({
      tableName: 'SystemTag',
      fields: ['tag'],
      condition: {
        resourceType: 'SoftwarePackageVO',
        tag: {
          [ZOp.like]: 'ZMigrate%'
        }
      }
    })
    const { results } = await this.zqlService.call(zql)
    const systemTags = results?.[0]?.inventories ?? []

    // tag 格式: "ZMigrateGatewayImage::imageUuid", "ZMigrateLinuxBootImage::imageUuid" 等
    // 从 :: 后面提取 imageUuid，建立 set 用于快速查找
    const zmigrateImageUuids = new Set<string>()
    for (const item of systemTags) {
      const parts = item.tag?.split('::')
      if (parts?.[1]) {
        zmigrateImageUuids.add(parts[1])
      }
    }

    return uuids.map(uuid => zmigrateImageUuids.has(uuid))
  }

  async getSummarys(conditions) {
    const stateList = ['total', 'available', 'destroyed']
    const result = {}
    await Promise.all(
      stateList.map(state => {
        return this.getSummary(state, conditions).then(resp => {
          result[state] = resp
        })
      })
    )
    return result
  }

  async getSummary(state, condtions = []) {
    const baseConditons: ICondition[] = [
      {
        key: 'format',
        op: Op.ne,
        value: 'vmtx'
      },
      {
        key: 'system',
        op: Op.eq,
        value: 'false'
      }
    ].concat(condtions)

    switch (state) {
      case 'total':
        break
      case 'available':
        baseConditons.push({
          key: 'status',
          op: Op.ne,
          value: 'Deleted'
        })
        break
      case 'destroyed':
        baseConditons.push({
          key: 'status',
          op: Op.eq,
          value: 'Deleted'
        })
        break
      default:
        break
    }

    const zqlObject = {
      tableName: 'Image',
      condition: QueryConditionTranslator.translate(baseConditons),
      action: ZQLAction.COUNT
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    return results?.[0]?.total ?? 0
  }

  async getGuestOsTypes() {
    const zqlObject = {
      action: ZQLAction.QUERY,
      tableName: 'GuestOscategory',
      orderBy: 'osRelease',
      orderDirection: 'asc' as const
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories
    let list = []
    if (inventories?.length) {
      // 获取平台
      list = [
        { platform: 'Linux', children: [] },
        { platform: 'Windows', children: [] },
        { platform: 'Other', children: [] }
      ]
      // 获取平台对应发行商
      list?.map(it => {
        const guestNameOptions = []
        inventories?.map(item => {
          if (
            !_find(guestNameOptions, ['guestName', item?.name]) &&
            item?.platform === it?.platform
          ) {
            guestNameOptions.push({ guestName: item?.name, children: [] })
          }
        })
        it.children = guestNameOptions
      })
      // 获取发行商对应操作系统版本
      list?.map(it => {
        it?.children?.map(item => {
          item.children = inventories?.filter(guestOs => guestOs?.name === item?.guestName)
        })
      })
    }
    return { list }
  }

  async getGuestOsDetial(guestOs: string) {
    const zqlObject = {
      action: ZQLAction.QUERY,
      tableName: 'GuestOscategory',
      orderBy: 'osRelease',
      orderDirection: 'asc' as const
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories
    const list = inventories?.filter(it => it?.osRelease === guestOs)
    return list || []
  }

  async getGuestNameList() {
    const zqlObject = {
      action: ZQLAction.QUERY,
      tableName: 'GuestOscategory',
      orderBy: 'osRelease',
      orderDirection: 'asc' as const
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const inventories = results?.[0]?.inventories
    const list = []
    // 获取发行商
    inventories?.map(it => {
      if (!_find(list, ['name', it?.name])) {
        list.push(it)
      }
    })
    return list
  }

  async getManagementNodeArch(): Promise<ManagementNodeArch> {
    return await this.getManagementNodeArchAction.call({})
  }

  async getGuestOsCpuMemHotAddInfoList(args: IQueryAction): Promise<GuestOsCpuMemHotAddInfoList> {
    const { conditions = [], start = 0, limit, sortBy, sortDirection } = args
    const [, extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'name',
      'cpuMemHotAdd',
      'guestOsType'
    ])
    const extraConditions: Array<(val: IHotAddInfo) => boolean> = []
    if (extraConditionMap.name?.value) {
      const name = extraConditionMap.name.value.toLocaleLowerCase()
      extraConditions.push(val => val.name.toLocaleLowerCase().includes(name))
    }
    if (extraConditionMap.cpuMemHotAdd?.values?.length === 1) {
      if (extraConditionMap.cpuMemHotAdd.values[0] === CpuMemHotAdd.supported) {
        extraConditions.push(val => val.cpu && val.mem)
      } else {
        extraConditions.push(val => !val.cpu || !val.mem)
      }
    }
    if (extraConditionMap.guestOsType?.values?.length) {
      const guestOsTypes = extraConditionMap.guestOsType.values
      extraConditions.push(val => guestOsTypes.includes(val.guestOsType))
    }
    const data = HotAddInfo.filter(val => extraConditions.every(fn => fn(val)))
    if (sortBy === 'name' || sortBy === 'bits') {
      data.sort(
        sortDirection === SortDirectionValidValues.asc
          ? (lhs, rhs) => lhs[sortBy].localeCompare(rhs[sortBy])
          : (lhs, rhs) => rhs[sortBy].localeCompare(lhs[sortBy])
      )
    }
    const total = data.length
    const list = data.slice(start, limit ? start + limit : total).map(val => ({
      ...val,
      cpuMemHotAdd: val.cpu && val.mem ? CpuMemHotAdd.supported : CpuMemHotAdd.notSupport
    }))
    return { list, total }
  }
}

export interface GetResourceAccountActionParam {
  resourceUuids: any[]
}
