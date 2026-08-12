import { Inject, Injectable } from '@nestjs/common'
import DataLoader from 'dataloader'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetResourceAccountAction } from '@/api/zstack/GetResourceAccountAction'
import { ResourceLoader } from '@/common/resource.dataloader'
import ZQL, { ZOp } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'

import { ResourceShare, ShareType } from './owner.model'

@Injectable()
export class OwnerDataLoader {
  @Inject() getResourceAccount: GetResourceAccountAction
  @Inject() zqlService: ZQLService

  private ownerDataLoader
  private isShareToPublicLoader
  private shareTypeLoader
  private resourceShareLoader

  constructor() {
    this.ownerDataLoader = new DataLoader(this._query)
    this.isShareToPublicLoader = new DataLoader(this._queryIsShareToPublic)
    this.shareTypeLoader = new DataLoader(this._queryResourceShareType)
    this.resourceShareLoader = new DataLoader(this._queryResourceShare)
  }

  query(uuid) {
    return this.ownerDataLoader.load(uuid)
  }

  // zsv 已经没了iam2
  private _query = async (uuids: string[]) => {
    // 做一个切割，不然url可能太长导致请求失败
    const resourceUuidsList = _.chunk(uuids, 50)

    const resourceAccountMap = {}

    await Promise.all(
      _.map(resourceUuidsList, async resourceUuids => {
        return await this.getResourceAccount
          .call({
            resourceUuids
          })
          .then(resp => {
            _.assign(resourceAccountMap, _.get(resp, 'inventories'))
          })
      })
    )

    return uuids.map(resourceUuid => {
      const accountUuid = _.get(resourceAccountMap, [resourceUuid, 'uuid'])
      return {
        uuid: accountUuid, // 如果获取不到就获取accountUuid
        name: _.get(resourceAccountMap, [resourceUuid, 'name']),
        linkedAccountUuid: _.get(resourceAccountMap, [resourceUuid, 'uuid']),
        type: 'account'
      }
    })
  }

  queryIsShareToPublic(uuid) {
    return this.isShareToPublicLoader.load(uuid)
  }

  private _queryIsShareToPublic = async (uuids: string[]) => {
    // const params: IQueryParam = {
    //   conditions: [
    //     { key: 'resourceUuid', op: Op.in, values: uuids },
    //     { key: 'toPublic', op: Op.eq, value: 'true' }
    //   ]
    // }
    const zqlObject: ZqlObject = {
      tableName: 'AccountResourceRef',
      condition: {
        resourceUuid: {
          [ZOp.in]: uuids
        },
        toPublic: true
      }
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    // const resp = await this.querySharedResourceAction.call(params)
    const inventories = results?.[0]?.inventories
    return uuids.map(uuid => {
      const item = _.find(inventories, item => item.resourceUuid === uuid && item.toPublic)
      return !!item
    })
  }

  queryResourceShareType(uuid: string) {
    return this.shareTypeLoader.load(uuid)
  }

  private _queryResourceShareType = async (uuids: string[]): Promise<ShareType[]> => {
    const zqlQueries = ZQL.multStringify([
      {
        tableName: 'AccountResourceRef',
        condition: {
          resourceUuid: {
            [ZOp.in]: uuids
          },
          type: {
            [ZOp.ne]: 'Own'
          }
        }
      },
      {
        tableName: 'AccountGroupResourceRef',
        condition: {
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])

    const { results } = await this.zqlService.call(zqlQueries)

    const accountResourceRefInventories = results?.[0]?.inventories || []
    const accountGroupResourceRefInventories = results?.[1]?.inventories || []

    return uuids.map(uuid => {
      const accountItem = accountResourceRefInventories.find(item => item.resourceUuid === uuid)
      const groupItem = accountGroupResourceRefInventories.find(item => item.resourceUuid === uuid)

      if (accountItem && accountItem.type === 'SharePublic') {
        return ShareType.Public
      }
      if (accountItem || groupItem) {
        return ShareType.Group
      }
      return ShareType.None
    })
  }

  queryResourceShare(uuid: string) {
    return this.resourceShareLoader.load(uuid)
  }

  private _queryResourceShare = async (uuids: string[]): Promise<ResourceShare[]> => {
    const zqlQueries = ZQL.multStringify([
      {
        tableName: 'AccountResourceRef',
        condition: {
          resourceUuid: {
            [ZOp.in]: uuids
          },
          type: {
            [ZOp.ne]: 'Own'
          }
        }
      },
      {
        tableName: 'AccountGroupResourceRef',
        condition: {
          resourceUuid: {
            [ZOp.in]: uuids
          }
        }
      }
    ])

    const { results } = await this.zqlService.call(zqlQueries)

    const accountResourceRefInventories = results?.[0]?.inventories || []
    const accountGroupResourceRefInventories = results?.[1]?.inventories || []

    return uuids.map(uuid => {
      const accountItem = accountResourceRefInventories.find(item => item.resourceUuid === uuid)
      const groupItem = accountGroupResourceRefInventories.find(item => item.resourceUuid === uuid)

      if (accountItem && accountItem.type === 'SharePublic') {
        return {
          resourceUuid: uuid,
          shareType: ShareType.Public
        }
      }
      if (accountItem || groupItem) {
        return {
          resourceUuid: uuid,
          shareType: ShareType.Group
        }
      }
      return {
        resourceUuid: uuid,
        shareType: ShareType.None
      }
    })
  }
}

@Injectable()
export class OwnerByAccountUuidDataLoader extends ResourceLoader {
  private nameloader

  constructor() {
    super()
    this.nameloader = new DataLoader(this._query)
  }

  query(uuid) {
    return this.nameloader.load(uuid)
  }

  _query = async (uuids: readonly string[]) => {
    const multAccountZql = uuids.map(uuid => {
      return {
        tableName: 'Account',
        condition: { uuid },
        namedAs: uuid,
        fields: ['name', 'uuid']
      }
    })
    const accountZql = ZQL.multStringify(multAccountZql)
    const { results: accountResults } = await this.zqlService.call(accountZql)

    return uuids.map(uuid => {
      const account = accountResults?.find(_hy => _hy.name === uuid)

      return _.get(account, 'inventories.[0]', null)
    })
  }
}

@Injectable()
export class OwnerByAccountUuidsDataLoader extends ResourceLoader {
  private nameloader

  constructor() {
    super()
    this.nameloader = new DataLoader(this._query)
  }

  query(uuid) {
    return this.nameloader.load(uuid)
  }

  _query = async (uuids: readonly string[]) => {
    const multAccountZql = uuids.map(uuid => {
      return {
        tableName: 'Account',
        condition: { uuid },
        namedAs: uuid,
        fields: ['name', 'uuid']
      }
    })
    const accountZql = ZQL.multStringify(multAccountZql)
    const { results: accountResults } = await this.zqlService.call(accountZql)

    return uuids.map(uuid => {
      const account = accountResults?.find(_hy => _hy.name === uuid)

      return {
        uuid: _.get(account, 'inventories.[0].uuid'),
        name: _.get(account, 'inventories.[0].name'),
        type: 'account'
      }
    })
  }
}
