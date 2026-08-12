import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { ValidateSessionAction } from '@/api/zstack/ValidateSessionAction'
import { Identity, LoginOAuthInput } from '@/identity/model/login.model'

import { ZsHttpService } from '../../../common/trans/zs-http-service/zs-http-service.service'
import { ZsSession } from '../../../model/zs-session.model'

@Injectable()
export class LoginOAuthService {
  @Inject() zsHttpService: ZsHttpService
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() validateSessionAction: ValidateSessionAction
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  async action(param: LoginOAuthInput) {
    const { loginType } = param
    if (loginType === 'iam1') {
      return await this.loginIAM1OAuth(param)
    }

    return {
      isLogined: false
    }
  }

  async loginIAM1OAuth(param: LoginOAuthInput) {
    const { sessionId, accountUuid } = param
    const res = await this.validateSessionAction.call({
      sessionUuid: sessionId
    })
    if (!res?.valid) {
      return {
        isLogined: false
      }
    }

    // 检查是否已存在相同的 Session，避免重复创建
    const existingSession = await this.zsSession.findOne({
      where: { sessionId }
    })

    if (existingSession) {
      // Session 已存在，直接复用
      return {
        isLogined: true,
        accountUuid: existingSession.accountId,
        userUuid: existingSession.accountId,
        sessionId,
        currentIdentity: existingSession.identity as Identity
      }
    }

    let accountInfoList: { inventories?: Array<{ name?: string; type?: string }> }
    try {
      accountInfoList = await this.queryAccountAction.call(
        {
          fields: ['type', 'name'],
          conditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: accountUuid
            }
          ]
        },
        { sessionId }
      )
    } catch (error) {
      console.error('Failed to query account during IAM1 OAuth login', {
        accountUuid,
        error
      })
      return {
        isLogined: false
      }
    }

    const accountInfo = _.get(accountInfoList, ['inventories', '0'])
    if (!accountInfo) {
      return {
        isLogined: false
      }
    }

    const accountName = accountInfo.name
    const accountType = accountInfo.type

    if (!accountName || !accountType) {
      return {
        isLogined: false
      }
    }

    // mysql 不区分大小写。前后空格会被忽略掉。SystemAdmin 也是一种admin账户，可以cli创建。
    const currentIdentity =
      _.isEqual(_.toLower(_.trim(accountName)), 'admin') || _.isEqual(accountType, 'SystemAdmin')
        ? Identity.Admin
        : Identity.NormalAccount

    // Session 不存在，创建新记录
    await this.zsSession.create({
      sessionId,
      // Keep the legacy uid column populated with the canonical account identity.
      userId: accountUuid,
      accountId: accountUuid,
      identity: currentIdentity,
      type: 'Account',
      createDate: new Date()
    })

    return {
      isLogined: true,
      accountUuid,
      userUuid: accountUuid,
      sessionId,
      currentIdentity
    }
  }
}
