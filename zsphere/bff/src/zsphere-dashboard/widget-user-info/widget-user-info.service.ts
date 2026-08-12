import { Inject, Injectable } from '@nestjs/common'
import { get as _get } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { GetCurrentTimeAction } from '@/api/zstack/GetCurrentTimeAction'
import ZQL, { ZOp, ZQLAction } from '@/common/zql'

import {
  QuerySummaryUserInfoArgs,
  QuerySummaryUserInfoType,
  QueryWidgetUserInfoArgs,
  QueryWidgetUserInfoType,
  WidgetUserInfo
} from './widget-user-info.model'

@Injectable()
export class WidgetUserInfoService {
  @Inject()
  zqlService: ZQLService
  @Inject()
  getCurrentTimeAction: GetCurrentTimeAction

  async getWidgetUserInfo(params) {
    const { queryType = QueryWidgetUserInfoType.Admin, projectUuid, zoneUuid } = params

    const resp = await this.getCurrentTimeAction.call({})
    const platformTime = resp?.currentTime?.MillionSeconds

    let result: WidgetUserInfo = { platformTime }

    switch (queryType) {
      case QueryWidgetUserInfoType.Admin:
        const zqlObjList = [
          {
            action: ZQLAction.COUNT,
            tableName: 'Account',
            condition: {
              name: {
                [ZOp.ne]: 'admin'
              }
            }
          }
        ]
        const zql = ZQL.multStringify(zqlObjList)
        const resp = await this.zqlService.call(zql)
        const countResults = resp?.results?.map(it => it.total)
        const accountNum = _get(countResults, 0, 0)

        result = {
          accountNum,

          platformTime
        }
        break

      case QueryWidgetUserInfoType.OrganizationOperator:
        const _result = await this.getOrganizationOperatorExtendInfo(params)
        result = {
          platformTime,
          ..._result
        }
        break
      default:
        break
    }
    return result
  }

  async getSummaryUserInfo(args: QuerySummaryUserInfoArgs) {
    const { type } = args
    if (type === QuerySummaryUserInfoType.IAM2) {
      const zqlObjects = [
        {
          action: ZQLAction.COUNT,
          tableName: 'iam2virtualid',
          condition: {
            ['attributes.name']: {
              [ZOp.in]: ['__PlatformAdmin__', '__IAM2PlatformAdmin__']
            }
          }
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'iam2virtualid'
        }
      ]

      const zql = ZQL.multStringify(zqlObjects)
      const { results } = await this.zqlService.call(zql)
      return {
        platformAdminNum: results[0].total ?? 0,
        normalUserNum: (results[1].total ?? 0) - (results[0].total ?? 0)
      }
    } else {
      const zqlObjects = [
        {
          action: ZQLAction.COUNT,
          tableName: 'account'
        },
        {
          action: ZQLAction.COUNT,
          tableName: 'user'
        }
      ]

      const zql = ZQL.multStringify(zqlObjects)
      const { results } = await this.zqlService.call(zql)
      return {
        accountNum: results[0].total ?? 0,
        userNum: results[1].total ?? 0
      }
    }
  }

  async getOrganizationOperatorExtendInfo(args: QueryWidgetUserInfoArgs) {
    const { virtualID } = args
    const zqls = [
      {
        tableName: 'IAM2Organization',
        fields: ['name', 'uuid'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'IAM2OrganizationAttribute',
                fields: ['organizationUuid'],
                condition: {
                  value: virtualID,
                  name: '__OrganizationOperation__'
                }
              }
            }
          }
        }
      },
      {
        tableName: 'iam2virtualid',
        fields: ['name', 'uuid'],
        condition: {
          uuid: {
            [ZOp.in]: {
              [ZOp.query]: {
                tableName: 'IAM2OrganizationAttribute',
                fields: ['value'],
                condition: {
                  name: '__OrganizationSupervisor__',
                  organizationUuid: {
                    [ZOp.in]: {
                      [ZOp.query]: {
                        tableName: 'IAM2OrganizationAttribute',
                        fields: ['organizationUuid'],
                        condition: {
                          value: virtualID,
                          name: '__OrganizationOperation__'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        action: ZQLAction.COUNT,
        tableName: 'IAM2Project',
        condition: {}
      }
    ]
    const zqlString = ZQL.multStringify(zqls)
    const resp = await this.zqlService.call(zqlString)
    const organization = _get(resp.results, [0, 'inventories', 0], {})
    const organizationSupervisor = _get(resp.results, [1, 'inventories', 0], {})

    return {
      organization,
      organizationSupervisor
    }
  }
}
