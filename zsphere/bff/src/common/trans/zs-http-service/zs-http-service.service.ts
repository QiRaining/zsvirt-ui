import { HttpService } from '@nestjs/axios'
import { Injectable, Inject, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-errors'
import * as _ from 'lodash'
import { firstValueFrom } from 'rxjs'

import { ActionInfo } from '@/api/zstack/base/types'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'

import { WebhookCallbackService } from '../../../api/zstack/base/webhook-callback.service'
import { Logger } from '../../logger/logger.decorator'
import { ZSLoggerService } from '../../logger/logger.service'
import { genUuid } from '../../../utils'

@Injectable({ scope: Scope.DEFAULT })
export class ZsHttpService {
  @Inject() private configService: ConfigService
  @Inject(CONTEXT) private context
  @Inject() private readonly httpService: HttpService
  @Inject() pubSubService: PubSubService
  @Inject() webhookCallbackService: WebhookCallbackService
  @Logger(ZsHttpService.name) private logger: ZSLoggerService
  stringify(data: any) {
    if (typeof data === 'string') {
      return data
    }
    return JSON.stringify(data)
  }

  // 用于安全地从 context 获取指定的 HTTP 头部信息
  private getHeader(headerName: string): string | undefined {
    const headers = this.context?.req?.headers || this.context?.headers
    return headers?.[headerName]
  }

  async get<T = any>(
    apiPath: string,
    { apiId = undefined, actionId = undefined, sessionId = undefined }: ActionInfo = {}
  ): Promise<T> {
    // 进来的 apiPath 开头可能会带 /，因此需要去掉。http://192.0.2.28:8080/zstack/v1//vm-instances/candidate-destinations
    apiPath = apiPath.replace(/^\//, '')
    const apiInspector: boolean = this.configService.get<string>('API_INSPECTOR') === 'true'
    const headers = {
      'Content-Type': 'application/json'
    }

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader('x-forwarded-for')
    const userAgent = this.getHeader('user-agent')
    const xRealIp = this.getHeader('x-real-ip')

    const xSessionId = this.getHeader('x-session-id')
    const xJobId = this.getHeader('x-job-id')
    const traceId = this.getHeader('trace_id')

    if (xForwardedFor) {
      headers['X-Forwarded-For'] = xForwardedFor
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // X-Request-Ip 用来处理IP黑白名单限制 （前后端约定）
    if (xRealIp) {
      headers['X-Request-Ip'] = _.get(_.split(xForwardedFor, ','), '0', xRealIp) || xRealIp
    }

    if (!sessionId) {
      sessionId = xSessionId
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }

    if (!actionId) {
      actionId = xJobId
    }

    if (!apiId) {
      apiId = genUuid()
    }

    headers['X-Job-UUID'] = apiId

    const reqPath = `${this.configService.get<string>('ZS_MN_SERVER')}/zstack/v1/${apiPath}`

    if (!apiPath.endsWith('/valid')) {
      this.logger.debugJson({
        method: 'GET',
        traceId,
        sessionId,
        mainJobId: actionId,
        apiId,
        type: 'request',
        apiPath
      })
    }
    let resp
    try {
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: 'Request',
              method: 'GET',
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              sdkName: this.getCallerSdkName()
            }
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
      resp = await firstValueFrom(this.httpService.get(reqPath, { headers }))
      if (!apiPath.endsWith('/valid')) {
        this.logger.debugJson({
          method: 'GET',
          traceId,
          sessionId,
          mainJobId: actionId,
          apiId,
          type: 'response',
          apiPath
        })
        if (apiInspector) {
          try {
            this.pubSubService.apiInspector({
              sessionId,
              payload: {
                traceId,
                apiId,
                type: 'Response',
                method: 'GET',
                timestamp: new Date().getTime(),
                response: JSON.stringify(resp?.data)
              }
            })
          } catch (error) {
            this.logger.error(error)
          }
        }
      }
    } catch (e) {
      this.logger.errorJson({
        method: 'GET',
        traceId,
        sessionId,
        mainJobId: actionId,
        apiId,
        type: 'response',
        apiPath,
        error: e
      })
      const data = e?.response?.data
      // todo 优化gql动态字段 1006 无权限访问
      // 特殊的get接口需要暴露SYS.1006 报错
      const apiPathList = ['twofactorauthentication/secret']
      if (data?.error?.code === 'SYS.1006' && !apiPathList.find(it => apiPath.indexOf(it) > -1)) {
        return { data: { inventories: [] }, status: 200 } as any
      }
      throw new ApolloError(this.stringify(data?.error || data || e))
    }
    return resp
  }

  async post(
    apiPath: string,
    data,
    { apiId = undefined, actionId = undefined, sessionId = undefined }: ActionInfo = {}
  ) {
    apiPath = apiPath.replace(/^\//, '')
    const apiInspector: boolean = this.configService.get<string>('API_INSPECTOR') === 'true'
    const host = this.configService.get<string>('HOST')
    const port = this.configService.get<string>('PORT')
    const webhookUrl = `http://${host}:${port}/webhook`
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Web-Hook': webhookUrl
    }
    // 记录 webhook URL，便于排查问题
    if (apiId) {
      this.logger.debugJson({
        method: 'POST',
        apiId,
        webhookUrl,
        host,
        port,
        type: 'webhook_config'
      })
    }

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader('x-forwarded-for')
    const userAgent = this.getHeader('user-agent')
    const xRealIp = this.getHeader('x-real-ip')

    const xSessionId = this.getHeader('x-session-id')
    const xJobId = this.getHeader('x-job-id')
    const traceId = this.getHeader('trace_id')

    if (xForwardedFor) {
      headers['X-Forwarded-For'] = xForwardedFor
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // X-Request-Ip 用来处理IP黑白名单限制 （前后端约定）
    if (xRealIp) {
      headers['X-Request-Ip'] = _.get(_.split(xForwardedFor, ','), '0', xRealIp) || xRealIp
    }

    if (!sessionId) {
      sessionId = xSessionId
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }

    if (!actionId) {
      actionId = xJobId
    }

    if (!apiId) {
      apiId = genUuid()
    }

    headers['X-Job-UUID'] = apiId

    const reqPath = `${this.configService.get<string>('ZS_MN_SERVER')}/zstack/v1/${apiPath}`

    this.logger.debugJson({
      method: 'POST',
      traceId,
      sessionId,
      mainJobId: actionId,
      apiId,
      type: 'request',
      apiPath
    })
    let resp
    try {
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: 'Request',
              method: 'POST',
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              body: JSON.stringify(data),
              sdkName: this.getCallerSdkName()
            }
          })
          this.webhookCallbackService.update(apiId, {
            sessionId,
            method: 'POST'
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
      resp = await firstValueFrom(this.httpService.post(reqPath, data, { headers }))
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: this._isWebhookCallbackData(resp?.data) ? 'WaitingWebHook' : 'Response',
              method: 'POST',
              timestamp: new Date().getTime(),
              response: JSON.stringify(resp?.data)
            }
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
    } catch (e) {
      this.logger.errorJson({
        method: 'POST',
        traceId,
        sessionId,
        mainJobId: actionId,
        apiId,
        type: 'response',
        apiPath,
        error: e
      })
      const data = e?.response?.data
      throw new ApolloError(this.stringify(data?.error || data))
    }
    return resp
  }

  async put<T = any>(
    apiPath: string,
    data,
    { apiId = undefined, actionId = undefined, sessionId = undefined }: ActionInfo = {}
  ): Promise<T> {
    apiPath = apiPath.replace(/^\//, '')
    const apiInspector: boolean = this.configService.get<string>('API_INSPECTOR') === 'true'
    const host = this.configService.get<string>('HOST')
    const port = this.configService.get<string>('PORT')
    const webhookUrl = `http://${host}:${port}/webhook`
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Web-Hook': webhookUrl
    }
    // 记录 webhook URL，便于排查问题
    if (apiId) {
      this.logger.debugJson({
        method: 'PUT',
        apiId,
        webhookUrl,
        host,
        port,
        type: 'webhook_config'
      })
    }

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader('x-forwarded-for')
    const userAgent = this.getHeader('user-agent')
    const xRealIp = this.getHeader('x-real-ip')

    const xSessionId = this.getHeader('x-session-id')
    const xJobId = this.getHeader('x-job-id')
    const traceId = this.getHeader('trace_id')

    if (xForwardedFor) {
      headers['X-Forwarded-For'] = xForwardedFor
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // X-Request-Ip 用来处理IP黑白名单限制 （前后端约定）
    if (xRealIp) {
      headers['X-Request-Ip'] = _.get(_.split(xForwardedFor, ','), '0', xRealIp) || xRealIp
    }

    if (!sessionId) {
      sessionId = xSessionId
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }

    if (!actionId) {
      actionId = xJobId
    }

    if (!apiId) {
      apiId = genUuid()
    }

    headers['X-Job-UUID'] = apiId

    const reqPath = `${this.configService.get<string>('ZS_MN_SERVER')}/zstack/v1/${apiPath}`

    this.logger.debugJson({
      method: 'PUT',
      traceId,
      sessionId,
      mainJobId: actionId,
      apiId,
      type: 'request',
      apiPath
    })
    let resp
    try {
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: 'Request',
              method: 'PUT',
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              body: JSON.stringify(data),
              sdkName: this.getCallerSdkName()
            }
          })
          this.webhookCallbackService.update(apiId, {
            sessionId,
            method: 'PUT'
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
      resp = await firstValueFrom(this.httpService.put(reqPath, data, { headers }))
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: this._isWebhookCallbackData(resp?.data) ? 'WaitingWebHook' : 'Response',
              method: 'PUT',
              timestamp: new Date().getTime(),
              response: JSON.stringify(resp?.data)
            }
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
    } catch (e) {
      this.logger.errorJson({
        method: 'PUT',
        traceId,
        sessionId,
        mainJobId: actionId,
        apiId,
        type: 'response',
        apiPath,
        error: e
      })
      const data = e?.response?.data
      throw new ApolloError(this.stringify(data?.error || data))
    }
    return resp
  }

  async delete<T = any>(
    apiPath: string,
    { apiId = undefined, actionId = undefined, sessionId = undefined }: ActionInfo = {}
  ): Promise<T> {
    apiPath = apiPath.replace(/^\//, '')
    const apiInspector: boolean = this.configService.get<string>('API_INSPECTOR') === 'true'
    const host = this.configService.get<string>('HOST')
    const port = this.configService.get<string>('PORT')
    const webhookUrl = `http://${host}:${port}/webhook`
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Web-Hook': webhookUrl
    }
    // 记录 webhook URL，便于排查问题
    if (apiId) {
      this.logger.debugJson({
        method: 'POST',
        apiId,
        webhookUrl,
        host,
        port,
        type: 'webhook_config'
      })
    }

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader('x-forwarded-for')
    const userAgent = this.getHeader('user-agent')
    const xRealIp = this.getHeader('x-real-ip')

    const xSessionId = this.getHeader('x-session-id')
    const xJobId = this.getHeader('x-job-id')
    const traceId = this.getHeader('trace_id')

    if (xForwardedFor) {
      headers['X-Forwarded-For'] = xForwardedFor
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    // X-Request-Ip 用来处理IP黑白名单限制 （前后端约定）
    if (xRealIp) {
      headers['X-Request-Ip'] = _.get(_.split(xForwardedFor, ','), '0', xRealIp) || xRealIp
    }

    if (!sessionId) {
      sessionId = xSessionId
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }

    if (!actionId) {
      actionId = xJobId
    }

    if (!apiId) {
      apiId = genUuid()
    }

    headers['X-Job-UUID'] = apiId

    const reqPath = `${this.configService.get<string>('ZS_MN_SERVER')}/zstack/v1/${apiPath}`

    this.logger.debugJson({
      method: 'DELETE',
      traceId,
      sessionId,
      mainJobId: actionId,
      apiId,
      type: 'request',
      apiPath
    })
    let resp
    try {
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: 'Request',
              method: 'DELETE',
              timestamp: new Date().getTime(),
              reqPath: reqPath,
              sdkName: this.getCallerSdkName()
            }
          })
          this.webhookCallbackService.update(apiId, {
            sessionId,
            method: 'DELETE'
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
      resp = await firstValueFrom(this.httpService.delete(reqPath, { headers }))
      if (apiInspector) {
        try {
          this.pubSubService.apiInspector({
            sessionId,
            payload: {
              traceId,
              apiId,
              type: this._isWebhookCallbackData(resp?.data) ? 'WaitingWebHook' : 'Response',
              method: 'DELETE',
              timestamp: new Date().getTime()
            }
          })
        } catch (error) {
          this.logger.error(error)
        }
      }
    } catch (e) {
      this.logger.errorJson({
        method: 'DELETE',
        traceId,
        sessionId,
        mainJobId: actionId,
        apiId,
        type: 'reponse',
        apiPath,
        error: e
      })
      const data = e?.response?.data
      throw new ApolloError(this.stringify(data?.error || data))
    }
    return resp
  }

  _isWebhookCallbackData(data) {
    if (data?.apiTimeout && data?.location) {
      return true
    }
    return false
  }

  getCallerSdkName() {
    const error = new Error()
    // 访问错误对象的 stack 属性以获取调用栈信息
    const stack = error.stack

    const regex = /at\s+\w+\.\w+\s+\([^:]+:\d+:\d+\)/g

    const matches = stack.match(regex)
    const sdkname =
      matches?.[matches?.length ? matches?.length - 1 : 2]
        ?.split(/\s+/)?.[1]
        ?.split('.')?.[0]
        ?.split('Action')[0] ?? ''
    return sdkname
  }
}
