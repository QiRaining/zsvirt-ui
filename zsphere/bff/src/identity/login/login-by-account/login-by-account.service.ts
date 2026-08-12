import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { LogInByAccountAction } from '@/api/zstack/LogInByAccountAction'
import { QueryAccountAction } from '@/api/zstack/QueryAccountAction'
import { QueryCCSCertificateAction } from '@/api/zstack/QueryCCSCertificateAction'
import { Identity, LoginByAccountInput } from '@/identity/model/login.model'
import { DataProtectionService } from '@/zstack-cloud-code/crypto-compliance/data-protection/data-protection.service'

import { ZsHttpService } from '../../../common/trans/zs-http-service/zs-http-service.service'
import { ZsSession } from '../../../model/zs-session.model'
import { getAccountSessionIdentity } from '../account-session-identity'

@Injectable()
export class LoginByAccountService {
  @Inject(CONTEXT) private readonly context
  @Inject() zsHttpService: ZsHttpService
  @Inject() LoginByAccount: LogInByAccountAction
  @Inject() queryAccountAction: QueryAccountAction
  @Inject() queryCCSCertificateAction: QueryCCSCertificateAction
  @Inject() dataProtectionService: DataProtectionService
  @InjectModel(ZsSession) private zsSession: typeof ZsSession

  protected getRemoteAddr(): string {
    const ipList = [
      this.context.req.headers['x-real-ip'],
      this.context.req.headers['proxy-client-ip'],
      this.context.req.headers['x-forwarded-for'],
      this.context.req.headers['wl-proxy-client-ip'],
      this.context.req.headers['http_client_ip'],
      this.context.req.headers['http_x_forwarded_for'],
      this.context.req.ip
    ]

    return _.find(ipList, ip => !_.isEmpty(ip) && !_.isEqual('unknown', _.toLower(ip)))
  }

  protected getBrowserName(): string {
    const userAgent = this.context.req.headers['user-agent']
    const lowerUserAgent = _.toLower(userAgent) // 转换为小写以便不区分大小写地进行比较

    // 有序列表确保了浏览器检测的正确顺序
    const browserList = [
      { key: 'edg', name: 'Edge' }, // Microsoft Edge
      { key: 'chrome', name: 'Chrome' }, // Google Chrome
      { key: 'safari', name: 'Safari' }, // Safari，注意在 Chrome 检测后
      { key: 'firefox', name: 'Firefox' }, // Mozilla Firefox
      { key: 'opera', name: 'Opera' }, // Opera
      { key: 'trident/', name: 'IE' }, // Internet Explorer 11
      { key: 'msie', name: 'IE' }, // 早期版本的 Internet Explorer
      { key: 'tencenttraveler', name: 'Tencent Traveler' }, // 腾讯TT浏览器
      { key: '360se', name: '360' }, // 360 安全浏览器
      { key: 'metasr', name: 'Sogou Explorer' }, // 搜狗浏览器
      { key: 'postmanruntime/', name: 'Postman' }, // Postman
      { key: 'apipost-request/', name: 'ApiPost' }, // ApiPost
      { key: 'apifox/', name: 'ApiFox' } // ApiFox
    ]

    for (const { key, name } of browserList) {
      if (_.includes(lowerUserAgent, key)) {
        return name
      }
    }

    return 'Other' // 如果都不匹配，返回 'Other'
  }

  async action(param: LoginByAccountInput) {
    const clientInfo: LoginByAccountInput['clientInfo'] = {
      clientIp: this.getRemoteAddr(),
      clientBrowser: this.getBrowserName()
    }

    const rt = await this.LoginByAccount.call({ ...param, clientInfo })
    const { accountName } = param

    const { sessionId, userUuid, accountUuid } = getAccountSessionIdentity(rt.inventory)

    let accountInfoList = {}
    try {
      accountInfoList = await this.queryAccountAction.call(
        {
          fields: ['type'],
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
    } catch (e) {
      console.log(e)
    }

    const accountType = _.get(accountInfoList, ['inventories', '0', 'type'], 'Normal')

    // mysql 不区分大小写。前后空格会被忽略掉。SystemAdmin 也是一种admin账户，可以cli创建。
    const currentIdentity =
      _.isEqual(_.toLower(_.trim(accountName)), 'admin') || _.isEqual(accountType, 'SystemAdmin')
        ? Identity.Admin
        : Identity.NormalAccount

    const result: any = {
      accountUuid,
      userUuid,
      sessionId,
      currentIdentity
    }

    if (param?.systemTags?.length) {
      try {
        const ccsResp = await this.queryCCSCertificateAction.call(
          {
            conditions: [
              {
                key: 'userCertificateRefs.userUuid',
                value: userUuid
              }
            ]
          },
          { sessionId }
        )
        result.ccsCertificate = ccsResp?.inventories?.[0]
      } catch (e) {
        console.log(e)
      }
    }

    // 检查是否已存在相同的 Session，避免重复创建
    const existingSession = await this.zsSession.findOne({
      where: { sessionId }
    })

    if (!existingSession) {
      // Session 不存在，创建新记录
      await this.zsSession.create({
        sessionId,
        // zs_session.uid is a legacy NOT NULL column. Account sessions no longer
        // have a separate user UUID, so persist accountUuid in the compatibility column.
        userId: accountUuid,
        accountId: accountUuid,
        identity: currentIdentity,
        type: 'Account',
        createDate: new Date()
      })
    }

    // 数据保护：检查已有的操作记录是否被保护
    this.dataProtectionService.checkDataProtectionStatus(sessionId)

    return result
  }
}
