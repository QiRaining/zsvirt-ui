import { HttpService } from '@nestjs/axios'
import { Injectable, Inject, Scope } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CONTEXT } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-errors'

import { genUuid } from '../../../utils'

@Injectable({ scope: Scope.REQUEST })
export class MkHttpService {
  @Inject() private configService: ConfigService
  @Inject(CONTEXT) private context
  @Inject() private readonly httpService: HttpService

  stringify(data: any) {
    if (typeof data === 'string') {
      return data
    }
    return JSON.stringify(data)
  }

  getTraceId() {
    return this.context?.req?.headers?.trace_id
  }

  getServer() {
    return this.configService.get('ZS_MN_SERVER').replace(/:[0-9]+/, ':18618')
  }

  getHeaders(sessionId?: string, mainJobId?: string, apiId?: string) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8'
    }
    if (!sessionId) {
      sessionId = (this.context as any)?.req?.headers['x-session-id']
    }
    if (!mainJobId) {
      mainJobId = (this.context as any)?.req?.headers['x-job-id']
    }
    if (!apiId) {
      apiId = genUuid()
    }
    if (sessionId) {
      headers['Authorization'] = `OAuth ${sessionId}`
    }
    if (apiId) {
      headers['X-Job-UUID'] = apiId
    }
    return headers
  }

  async post(
    apiPath: string,
    data: any,
    apiId = undefined,
    mainJobId = undefined,
    sessionId = undefined
  ) {
    const server = this.getServer()
    const headers = this.getHeaders(sessionId, mainJobId, apiId)
    apiPath = apiPath.replace(/^\//, '')
    const reqPath = `${server}/${apiPath}`
    let resp: any
    try {
      resp = await this.httpService.post(reqPath, data, { headers }).toPromise()
    } catch (e) {
      const exceptionData = e.response?.data
      if (exceptionData?.message) {
        resp = {
          name: 'apiError',
          status: e.response?.status,
          data: exceptionData
        }
      } else {
        throw new ApolloError(e)
      }
    }
    return resp
  }

  async put(
    apiPath: string,
    data: any,
    apiId = undefined,
    mainJobId = undefined,
    sessionId = undefined
  ) {
    const server = this.getServer()
    const headers = this.getHeaders(sessionId, mainJobId, apiId)
    apiPath = apiPath.replace(/^\//, '')
    const reqPath = `${server}/${apiPath}`
    let resp: any
    try {
      resp = await this.httpService.put(reqPath, data, { headers }).toPromise()
    } catch (e) {
      const exceptionData = e.response?.data
      if (exceptionData?.message) {
        resp = {
          name: 'apiError',
          status: e.response?.status,
          data: exceptionData
        }
      } else {
        throw new ApolloError(e)
      }
    }
    return resp
  }

  async get(apiPath: string, apiId = undefined, mainJobId = undefined, sessionId = undefined) {
    const server = this.getServer()
    const headers = this.getHeaders(sessionId, mainJobId, apiId)
    apiPath = apiPath.replace(/^\//, '')
    const reqPath = `${server}/${apiPath}`
    let resp: any
    try {
      resp = await this.httpService.get(reqPath, { headers }).toPromise()
    } catch (e) {
      const exceptionData = e.response?.data
      if (exceptionData?.message) {
        resp = {
          name: 'apiError',
          status: e.response?.status,
          data: exceptionData
        }
      } else {
        throw new ApolloError(e)
      }
    }
    return resp
  }

  async delete(apiPath: string, apiId = undefined, mainJobId = undefined, sessionId = undefined) {
    const server = this.getServer()
    const headers = this.getHeaders(sessionId, mainJobId, apiId)
    apiPath = apiPath.replace(/^\//, '')
    const reqPath = `${server}/${apiPath}`
    let resp: any
    try {
      resp = await this.httpService.delete(reqPath, { headers }).toPromise()
    } catch (e) {
      const exceptionData = e.response?.data
      if (exceptionData?.message) {
        resp = {
          name: 'apiError',
          status: e.response?.status,
          data: exceptionData
        }
      } else {
        throw new ApolloError(e)
      }
    }
    return resp
  }
}
