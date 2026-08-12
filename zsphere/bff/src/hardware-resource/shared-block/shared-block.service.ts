import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { AddSharedBlockToSharedBlockGroupAction } from '@/api/zstack/AddSharedBlockToSharedBlockGroupAction'
import { conditionsToObject } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { DiscoverStrangePrimaryStorageAction } from '@/api/zstack/DiscoverStrangePrimaryStorageAction'
import { GetSharedBlockCandidateAction } from '@/api/zstack/GetSharedBlockCandidateAction'
import { QuerySharedBlockAction } from '@/api/zstack/QuerySharedBlockAction'
import { RefreshSharedblockDeviceCapacityAction } from '@/api/zstack/RefreshSharedblockDeviceCapacityAction'
import { ActionService } from '@/base/action-service'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import ZQL, { ZOp } from '@/common/zql/index'

import {
  CandidateSharedBlock as ICandidateSharedBlock,
  SharedBlockGroupLunsResponse
} from './shared-block.model'

@Injectable()
export class SharedBlockService extends ActionService {
  @Inject() zqlService: ZQLService
  @Inject() querySharedBlockAction: QuerySharedBlockAction
  @Inject() getSharedBlockCandidateAction: GetSharedBlockCandidateAction
  @Inject()
  addSharedBlockToSharedBlockGroupAction: AddSharedBlockToSharedBlockGroupAction
  @Inject()
  refreshSharedblockDeviceCapacityAction: RefreshSharedblockDeviceCapacityAction
  @Inject()
  discoverStrangePrimaryStorageAction: DiscoverStrangePrimaryStorageAction

  private getSharedBlockCapacityDataLoader
  private getLunSourceDataLoader
  private getSourceDataLoader

  constructor() {
    super()
    this.getSharedBlockCapacityDataLoader = new DataLoader(this._getSharedBlockCapacity)
    this.getLunSourceDataLoader = new DataLoader(this._getLunSource)
    this.getSourceDataLoader = new DataLoader(this._getSource)
  }

  async sharedBlockList(params: IQueryAction) {
    const { inventories: list = [], total } = await this.querySharedBlockAction.call(params)
    return {
      total,
      list
    }
  }

  async candidateSharedBlockList(queryArg: IQueryAction) {
    const {
      wwid: filterWwids = [],
      clusterUuid = '',
      __IscsiServerUuids__,
      __FiberChannelStorageUuids__,
      __NvmeTargetUuids__
    } = conditionsToObject(queryArg.conditions) as {
      wwid?: string[]
      clusterUuid: string
      __IscsiServerUuids__?: string | string[]
      __FiberChannelStorageUuids__?: string | string[]
      __NvmeTargetUuids__?: string | string[]
    }

    const _resultResp = await this.getSharedBlockCandidateAction.call({
      clusterUuid
    } as GetSharedBlockCandidateActionParam)

    let wwidsResult = _.filter(
      _resultResp?.results,
      sb => !_.includes(filterWwids, sb?.wwid) && !!sb?.source
    )

    const targetIdentifiers = _.compact(_.map(wwidsResult, result => result?.targetIdentifier))

    try {
      if (__IscsiServerUuids__) {
        const iscsiServerUuids = _.compact(_.flatten([__IscsiServerUuids__]))

        const zqlObject = {
          tableName: 'IscsiServer',
          condition: {
            uuid: {
              [ZOp.in]: iscsiServerUuids
            }
          }
        }

        const zql = ZQL.stringify(zqlObject)
        const { results } = await this.zqlService.call(zql)
        const iscsiServers = _.get(results, ['0', 'inventories'], [])
        const _targetIdentifiers = []

        for (const iscsiServer of iscsiServers) {
          const iscsiTargets = _.get(iscsiServer, 'iscsiTargets', [])
          for (const iscsiTarget of iscsiTargets) {
            _targetIdentifiers.push(iscsiTarget?.iqn)
          }
        }

        const _wwidsResult = _.reduce(
          wwidsResult || [],
          (arr, it) => {
            if (_.includes(_targetIdentifiers, it.targetIdentifier)) {
              arr.push(it)
            }
            return arr
          },
          []
        )

        wwidsResult = _wwidsResult
      }

      if (__FiberChannelStorageUuids__) {
        const fiberChannelStorageUuids = _.compact(_.flatten([__FiberChannelStorageUuids__]))

        const zqlObject = {
          tableName: 'FiberChannelStorage',
          fields: ['wwnn'],
          condition: {
            uuid: {
              [ZOp.in]: fiberChannelStorageUuids
            },
            wwnn: {
              [ZOp.in]: targetIdentifiers
            }
          }
        }

        const zql = ZQL.stringify(zqlObject)
        const { results } = await this.zqlService.call(zql)
        const fiberChannelStorages = _.get(results, ['0', 'inventories'], [])
        const wwnns = _.compact(_.map(fiberChannelStorages || [], it => it?.wwnn))

        const _wwidsResult = _.reduce(
          wwidsResult || [],
          (arr, it) => {
            if (_.includes(wwnns, it.targetIdentifier)) {
              arr.push(it)
            }
            return arr
          },
          []
        )

        wwidsResult = _wwidsResult
      }

      if (__NvmeTargetUuids__) {
        const nvmeTargetUuids = _.compact(_.flatten([__NvmeTargetUuids__]))

        const zqlObject = {
          tableName: 'NvmeTarget',
          fields: ['nqn'],
          condition: {
            uuid: {
              [ZOp.in]: nvmeTargetUuids
            },
            nqn: {
              [ZOp.in]: targetIdentifiers
            }
          }
        }

        const zql = ZQL.stringify(zqlObject)
        const { results } = await this.zqlService.call(zql)
        const fiberChannelStorages = _.get(results, ['0', 'inventories'], [])
        const nqns = _.compact(_.map(fiberChannelStorages || [], it => it?.nqn))

        const _wwidsResult = _.reduce(
          wwidsResult || [],
          (arr, it) => {
            if (_.includes(nqns, it.targetIdentifier)) {
              arr.push(it)
            }
            return arr
          },
          []
        )

        wwidsResult = _wwidsResult
      }
    } catch (error) {
      console.log(error)
    }

    const canSharedBlockList = _.chunk(wwidsResult, queryArg.limit)
    // 当前页数据
    let pageList = canSharedBlockList[queryArg.start / queryArg.limit] as ICandidateSharedBlock[]
    // 处理当前页数据相关字段
    pageList = pageList?.map(item => {
      item.uuid = item.name = item.wwid
      return item
    })

    return {
      list: pageList ?? [],
      total: wwidsResult?.length ?? 0
    }
  }

  /**
   * GetSharedBlockGroupLuns 实现
   *
   * 对应后端 APIDiscoverStrangePrimaryStorageMsg：
   * - 入参：clusterUuid（String）
   * - 返回：List<PrimaryStorageInventory> inventories（含 sharedBlocks）
   *
   * 底层调用 DiscoverStrangePrimaryStorageAction
   */
  async getSharedBlockGroupLuns(clusterUuid: string): Promise<SharedBlockGroupLunsResponse> {
    const resp = await this.discoverStrangePrimaryStorageAction.call({
      clusterUuid
    })

    const inventories = resp.inventories || []
    const lunInfos = inventories.map((inv: any) => ({
      vgUuid: inv.uuid,
      sharedBlocks: inv.sharedBlocks || [],
      status: inv.status
    }))

    return { lunInfos }
  }

  getSource(wwid: string) {
    return this.getSourceDataLoader.load(wwid)
  }

  _getSource = async (wwids: string[]) => {
    const lunZql = [
      {
        tableName: 'ScsiLun',
        fields: ['wwid', 'source'],
        condition: {
          wwid: {
            [ZOp.in]: wwids
          }
        }
      },
      {
        tableName: 'NvmeLun',
        fields: ['wwid', 'source'],
        condition: {
          wwid: {
            [ZOp.in]: wwids
          }
        }
      }
    ]

    const zql = ZQL.multStringify(lunZql)
    const { results } = await this.zqlService.call(zql)
    const scsiLuns = _.get(results, ['0', 'inventories'], [])
    const numeLuns = _.get(results, ['1', 'inventories'], [])

    const wwidSourceMap = {}

    for (const scsiLun of scsiLuns) {
      wwidSourceMap[scsiLun.wwid] = scsiLun?.source
    }
    for (const numeLun of numeLuns) {
      wwidSourceMap[numeLun.wwid] = numeLun?.source
    }

    return wwids.map(wwid => _.get(wwidSourceMap, wwid, null))
  }

  getLunSource(uuid) {
    return this.getLunSourceDataLoader.load(uuid)
  }

  _getLunSource = async (diskUuids: string[]) => {
    // 本来都是继承的ScsiLun，但是由于后端API查询不到，所以用了两个zql查询
    const lunZql = [
      {
        tableName: 'ScsiLun',
        fields: ['source', 'wwid'],
        condition: {
          wwid: {
            [ZOp.in]: _.uniq(diskUuids)
          }
        }
      },
      {
        tableName: 'NvmeLun',
        fields: ['source', 'wwid'],
        condition: {
          wwid: {
            [ZOp.in]: _.uniq(diskUuids)
          }
        }
      }
    ]

    const zql = ZQL.multStringify(lunZql)
    const { results } = await this.zqlService.call(zql)
    const scsiLuninventories = _.get(results, ['0', 'inventories'], [])
    const nvmeLuninventories = _.get(results, ['1', 'inventories'], [])

    const lunMap = {}

    // 没有用lodash 的 set，因为存在这种情况： "wwid": "uuid.d96e4583-3479-4cb1-9ccb-e6ca3cb7f3a1"
    _.forEach(scsiLuninventories || [], it => {
      lunMap[it?.wwid] = it?.source
    })

    _.forEach(nvmeLuninventories || [], it => {
      lunMap[it?.wwid] = it?.source
    })

    return diskUuids.map(diskUuid => _.get(lunMap, diskUuid, null))
  }

  getSharedBlockCapacity(uuid) {
    return this.getSharedBlockCapacityDataLoader.load(uuid)
  }

  _getSharedBlockCapacity = async (uuids: string[]) => {
    const policyZql = {
      tableName: 'SharedBlockCapacity',
      fields: ['uuid', 'availableCapacity', 'totalCapacity'],
      condition: {
        uuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(policyZql)
    const { results } = await this.zqlService.call(zql)

    const policyMap = _.reduce(
      _.get(results, ['0', 'inventories']),
      (obj, it) => {
        obj[it.uuid] = it
        return obj
      },
      {}
    )

    return uuids.map(uuid => _.get(policyMap, uuid, null))
  }
}

export interface GetSharedBlockCandidateActionParam {
  clusterUuid: string
}

export interface RefreshSharedblockDeviceCapacityActionParam {
  uuid?: string
  sharedBlockGroupUuid: string
}

export interface AddSharedBlockToSharedBlockGroupActionParam {
  uuid: string
  diskUuid: string
}
