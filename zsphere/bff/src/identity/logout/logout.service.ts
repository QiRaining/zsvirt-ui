import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import { LogOutAction } from '@/api/zstack/LogOutAction'

import { ZsHttpService } from '../../common/trans/zs-http-service/zs-http-service.service'
import { LogOutInput } from '../model/logout.model'

@Injectable()
export class LogoutService {
  @Inject(CONTEXT) private readonly context
  @Inject() zsHttpService: ZsHttpService
  @Inject() logOutAction: LogOutAction

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

  async action(input) {
    const clientInfo: LogOutInput['clientInfo'] = {
      clientIp: this.getRemoteAddr(),
      clientBrowser: this.getBrowserName()
    }

    const param: LogOutInput = {
      ...input,
      clientInfo
    }

    await this.logOutAction.call(param)

    return {
      sessionId: param?.sessionUuid
    }
  }
}
