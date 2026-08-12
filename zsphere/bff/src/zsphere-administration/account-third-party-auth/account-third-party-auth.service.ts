import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetOAuthClientSecretAction } from '@/api/zstack/GetOAuthClientSecretAction'
import ZQL, { ZQLAction, ZOp } from '@/common/zql'
import { Encrypt } from '@/utils/aesCipher'

@Injectable()
export class AccountThirdPartyAuthQueryService {
  @Inject()
  zqlService: ZQLService

  @Inject()
  getOAuthClientSecretAction: GetOAuthClientSecretAction

  private bindResourcerefDataLoader: any
  private redirectTemplateDataLoader: any

  constructor() {
    this.bindResourcerefDataLoader = new DataLoader(this._getBindResourceref)
    this.redirectTemplateDataLoader = new DataLoader(this._getRedirectTemplateRef)
  }

  async query(params) {
    const zqlObject = {
      tableName: 'ThirdPartyAccountSource',
      condition: {
        type: 'OAuth2'
      },
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    const data = results?.[0] ?? {}
    const { inventories: list = [], total = 0 } = data
    return { list, total }
  }

  getBindResourceref(uuid) {
    return this.bindResourcerefDataLoader.load(uuid)
  }

  _getBindResourceref = async (uuids = []) => {
    const zqlObject = {
      action: ZQLAction.COUNT,
      tableName: 'Account',
      condition: {
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'AccountThirdPartyAccountSourceRef',
              fields: ['accountUuid'],
              condition: {
                accountSourceUuid: {
                  [ZOp.in]: uuids
                }
              }
            }
          }
        }
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const userCountResp = await this.zqlService.call(zql)
    const _userCountResp = userCountResp?.results?.filter(it => it.total > 0)
    return uuids.map((_, index) => {
      return {
        userCount: _get(_userCountResp, [index, 'total'], 0)
      }
    })
  }

  getRedirectTemplateRef(uuid) {
    return this.redirectTemplateDataLoader.load(uuid)
  }

  _getRedirectTemplateRef = async (uuids: []) => {
    const zqlObj = {
      tableName: 'ssoredirectTemplate',
      fields: ['uuid', 'redirectTemplate', 'clientUuid'],
      condition: {
        clientUuid: {
          [ZOp.in]: uuids
        }
      }
    }

    const zql = ZQL.stringify(zqlObj)
    const resp = await this.zqlService.call(zql)
    const redirectTemplateRefList = _get(resp, ['results', 0, 'inventories'], [])
    return uuids.map(uuid => {
      const _redirectTemplateRef = redirectTemplateRefList.find(it => it.clientUuid === uuid) || []
      return {
        uuid: _redirectTemplateRef.uuid || '',
        redirectTemplate: _redirectTemplateRef.redirectTemplate || ''
      }
    })
  }

  async getClientSecret(uuid: string) {
    const result = await this.getOAuthClientSecretAction.call({ uuid })
    const secret = result?.clientSecret ?? ''
    return { clientSecret: secret ? Encrypt(secret) : '' }
  }
}
