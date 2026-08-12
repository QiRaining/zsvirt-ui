import { Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import {
  cloneDeep as _cloneDeep,
  get as _get,
  pick as _pick,
  compact as _compact,
  flatten as _flatten
} from 'lodash'

import {
  conditionsToObject,
  extractAndRemoveExtraCondition,
  QueryParam as IQueryParam,
  QueryParam
} from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  GetResourceAccountAction,
  GetResourceAccountActionParam as IGetResourceAccountActionParam
} from '@/api/zstack/GetResourceAccountAction'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { QueryAccountResourceRefAction } from '@/api/zstack/QueryAccountResourceRefAction'
import { QuerySNSEmailPlatformAction } from '@/api/zstack/QuerySNSEmailPlatformAction'
import { ActionService } from '@/base/action-service'
import {
  QueryAction as IQueryAction,
  Condition as ICondition
} from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator, ZOp } from '@/common/zql/index'
import { PlainObject, ZqlObject } from '@/common/zql/zqlBuilder'

import {
  EmailServerSettingQueryResp,
  EmailServerSettingQueryType
} from '../email-server-setting.model'

export class EmailServerSettingService extends ActionService {
  @Inject() querySNSEmailPlatformAction: QuerySNSEmailPlatformAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() getResourceAccountAction: GetResourceAccountAction
  @Inject() queryAccountResourceRefAction: QueryAccountResourceRefAction
  @Inject()
  zqlService: ZQLService

  private ownerDataloader
  private emaiPlatlDataloader

  constructor() {
    super()
    this.ownerDataloader = new DataLoader(this._getOwner)
    this.emaiPlatlDataloader = new DataLoader(this._getEmailPlatForm)
  }

  async query(params: IQueryAction) {
    const clone = _cloneDeep(params)
    const { type = EmailServerSettingQueryType.All } = clone

    let _extrazqlConditions
    let _resultResp = null
    switch (type) {
      case EmailServerSettingQueryType.All:
        break
      case EmailServerSettingQueryType.SelfHave:
        _extrazqlConditions = await this.getSelfHaveEmailServer(clone)
        break
      case EmailServerSettingQueryType.Share:
        _extrazqlConditions = await this.getSharedEmailServer(clone)

        break
    }

    const _zqlCondition = this.buildZqlCondition(clone.conditions, _extrazqlConditions)
    _resultResp = await this.getApplicationPlatform(params, _zqlCondition)
    return _resultResp
  }

  async getApplicationPlatform(param: IQueryAction, zqlCondition: PlainObject) {
    const zqlObject = {
      tableName: 'SNSApplicationPlatform',
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
    const emailServerList = results?.[0]?.inventories ?? []
    const total = results?.[0]?.total ?? 0

    return {
      list: emailServerList,
      total: total
    }
  }

  async getSharedEmailServer(params) {
    const conditionsMap = conditionsToObject(params.extraConditions)
    const candidateKeys = ['accountUuid']
    const candidateParams = _pick(conditionsMap, candidateKeys) as {
      accountUuid: string
    }

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['resourceUuid'],
            condition: {
              [ZOp.or]: [
                {
                  type: 'Share',
                  resourceType: 'SNSApplicationPlatformVO',
                  accountUuid: candidateParams.accountUuid
                },
                {
                  resourceType: 'SNSApplicationPlatformVO',
                  type: 'SharePublic'
                }
              ]
            }
          }
        }
      }
    }
  }

  async getSelfHaveEmailServer(params) {
    const conditionsMap = conditionsToObject(params.extraConditions)
    const candidateKeys = ['accountUuid']
    const candidateParams = _pick(conditionsMap, candidateKeys) as {
      accountUuid: string
    }

    return {
      uuid: {
        [ZOp.in]: {
          [ZOp.query]: {
            tableName: 'AccountResourceRef',
            fields: ['resourceUuid'],
            condition: {
              type: 'Own',
              resourceType: 'SNSApplicationPlatformVO',
              accountUuid: candidateParams.accountUuid
            }
          }
        }
      }
    }
  }

  async getEmailSeverSettingList(params: IQueryParam): Promise<EmailServerSettingQueryResp> {
    const { inventories: list, total } = await this.querySNSEmailPlatformAction.call(params)
    return { list, total }
  }

  async queryByUuid(uuid: string): Promise<EmailServerSettingQueryResp> {
    const zqlCondition: PlainObject = {
      uuid: {
        [ZOp.eq]: uuid
      }
    }
    const { list } = await this.getApplicationPlatform({}, zqlCondition)
    return list ?? null
  }

  async queryEmailPlatForm(uuid: string, key: string): Promise<string> {
    const params: IQueryParam = {
      conditions: [{ key: 'uuid', value: uuid }]
    }
    const { inventories } = await this.querySNSEmailPlatformAction.call(params)
    return inventories[0]?.[key]
  }

  getEmailPlatForm(uuid: string) {
    return this.emaiPlatlDataloader.load(uuid)
  }

  _getEmailPlatForm = async (uuids: string[]) => {
    const params: QueryParam = {
      conditions: [{ key: 'uuid', values: uuids, op: ZOp.in }]
    }
    const { inventories: list } = await this.querySNSEmailPlatformAction.call(params)
    return uuids.map(uuid => {
      const emailPlat = list.find(item => item.uuid === uuid)
      if (emailPlat) {
        return emailPlat
      } else {
        return null
      }
    })
  }

  getOwner(uuid) {
    return this.ownerDataloader.load(uuid)
  }

  _getOwner = async (uuids: string[]) => {
    const params: IGetResourceAccountActionParam = {
      resourceUuids: uuids
    }
    const { inventories } = await this.getResourceAccountAction.call(params)
    return uuids.map(uuid => {
      const owner = _get(inventories, uuid)
      if (owner) {
        return owner
      } else {
        return null
      }
    })
  }

  buildZqlCondition(conditions: ICondition[], extrazqlConditions: ZqlObject['condition']) {
    const specicalCondition: PlainObject[] = []
    const [_conditions, _extraConditionMap] = extractAndRemoveExtraCondition(conditions, [
      'shareType',
      'smtpServer',
      'smtpPort'
    ])
    if (_extraConditionMap['shareType']) {
      const _values = _flatten([
        _extraConditionMap['shareType']?.value || _extraConditionMap['shareType']?.values
      ])
      specicalCondition.push(
        QueryConditionTranslator.generateShareTypeZqlConditon(_values, 'SNSApplicationPlatformVO')
      )
    }
    if (_extraConditionMap['smtpServer']) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SNSEmailPlatform',
              fields: ['uuid'],
              condition: {
                smtpServer: {
                  [ZOp.like]: _extraConditionMap['smtpServer'].value
                }
              }
            }
          }
        }
      })
    }
    if (_extraConditionMap['smtpPort']) {
      specicalCondition.push({
        uuid: {
          [ZOp.in]: {
            [ZOp.query]: {
              tableName: 'SNSEmailPlatform',
              fields: ['uuid'],
              condition: {
                smtpPort: {
                  [ZOp.like]: _extraConditionMap['smtpPort'].value
                }
              }
            }
          }
        }
      })
    }

    //因为需要过滤共享类型，所以不能直接用接口querySNSEmailPlatformAction，所以要查SNSApplicationPlatform表，并过滤type为email的内容
    specicalCondition.push({
      type: {
        [ZOp.in]: ['Email']
      }
    })

    const zqlCondition = QueryConditionTranslator.translate(
      _conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )
    // console.log('=====>',JSON.stringify(zqlCondition))
    return zqlCondition
  }
}
