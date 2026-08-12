import { stat, readFile } from 'fs'
import { promisify } from 'util'

import { HttpService } from '@nestjs/axios'
import { Injectable, Inject, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApolloError } from 'apollo-server-errors'

import { genUuid } from '../../../utils'
import { Logger } from '../../logger/logger.decorator'
import { ZSLoggerService } from '../../logger/logger.service'

@Injectable({ scope: Scope.DEFAULT })
export class ZopsHttpServiceBase {
  @Inject() private configService: ConfigService
  @Inject() private readonly httpService: HttpService
  @Logger(ZopsHttpServiceBase.name) private logger: ZSLoggerService
  stringify(data: any) {
    if (typeof data === 'string') {
      return data
    }
    return JSON.stringify(data)
  }
  getTraceId() {
    return undefined
  }

  // 用于安全地从 context 获取指定的 HTTP 头部信息
  private getHeader(headerName: string): string | undefined {
    return undefined
  }

  async getZopsServer() {
    const promisifyRead = promisify(readFile)
    let server = ''
    try {
      const data = await promisifyRead('/usr/local/zops/zops.json')
      const obj = JSON.parse(data.toString())
      server = obj['ZOPS_SERVER']
    } catch (err) {
      console.log(err)
    }

    return (
      server ||
      this.configService.get<string>('ZOPS_SERVER') ||
      this.configService.get('ZS_MN_SERVER').replace(/:[0-9]+/, ':10010')
    )
  }

  async post(
    apiPath: string,
    data,
    apiId = undefined,
    mainJobId = undefined,
    sessionId = undefined
  ) {
    apiPath = apiPath.replace(/^\//, '')
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }

    // 只添加有效的头部值
    const xForwardedFor = this.getHeader('x-forwarded-for')
    const userAgent = this.getHeader('user-agent')

    const xSessionId = this.getHeader('x-session-id')
    const xJobId = this.getHeader('x-job-id')
    const traceId = this.getHeader('trace_id')

    if (xForwardedFor) {
      headers['X-Forwarded-For'] = xForwardedFor
    }
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }

    if (!sessionId) {
      sessionId = xSessionId
    }
    if (!apiId) {
      apiId = genUuid()
    }

    if (!mainJobId) {
      mainJobId = xJobId
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }

    headers['X-Job-UUID'] = apiId

    const server = await this.getZopsServer()
    const reqPath = `${server}/${apiPath}`

    this.logger.debug(
      `[nginxTraceId: ${traceId}] [POST]: [sessionId: ${sessionId}] [mainJobId: ${mainJobId}] [apiId: ${apiId}] ${reqPath}`,
      JSON.stringify(data)
    )
    let resp: any
    try {
      const rt = await this.httpService.post(reqPath, data, { headers }).toPromise()
      if (rt.data?.success === false) {
        resp = { data: rt.data.error, status: 400 }
      } else {
        resp = rt
      }
    } catch (e) {
      const exceptionData = e?.response?.data
      if (exceptionData?.success === false) {
        resp = { data: exceptionData.error, status: 400 }
      } else {
        throw new ApolloError(this.stringify(exceptionData?.error || exceptionData))
      }
    }
    try {
      this.logger.debug(
        ` [nginxTraceId: ${traceId}] [RESP]: [sessionId: ${sessionId}] [mainJobId: ${mainJobId}] [apiId: ${apiId}] ${JSON.stringify(
          resp?.data
        )}`
      )
    } catch (e) {
      this.logger.error(
        ` [nginxTraceId: ${traceId}] [RESP]: [reqPath: ${reqPath}] [sessionId: ${sessionId}] [mainJobId: ${mainJobId}] [apiId: ${apiId}] stringify resp failed: ${e}`
      )
    }
    return resp
  }
}
