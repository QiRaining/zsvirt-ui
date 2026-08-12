import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ActionBase } from '@/api/zstack/base/action-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZopsHttpService } from '@/common/trans/zs-http-service/zops-http-service.service'
import { genUuid } from '@/utils'

@Injectable()
export class CreateInspectionTaskAction extends ActionBase {
  @Inject() zopsHttpService: ZopsHttpService
  @Inject() declare webhookCallbackService: WebhookCallbackService

  async call(
    param: CreateInspectionTaskActionParam,
    _info: ActionInfo = {},
    record = true
  ): Promise<CreateInspectionTaskResult> {
    const info = _.cloneDeep(_info)
    if (!info.apiId) {
      info.apiId = genUuid()
    }
    let apiRecord: any
    if (record) {
      apiRecord = await this.recordStart(param, info, CreateInspectionTaskAction.name)
    }
    const httpRequestPromise = this.zopsHttpService.post(
      `/actions/inspection-task`,
      param,
      info.apiId,
      info.actionId,
      info.sessionId
    )
    const returnPromise = new Promise((resolve, rejects) => {
      this.webhookCallbackService.set(info.apiId, resolve, rejects)
    })
    const rt = await httpRequestPromise
    let { apiTimeout } = rt.data
    apiTimeout = apiTimeout || 30 * 60 * 1000
    if (rt.status === 200) {
      this.webhookCallbackService.remove(info.apiId)
      if (record) {
        await this.recordSuccess(rt.data, apiRecord)
      }
      return rt.data
    } else if (rt.status === 202) {
      let timeout
      try {
        timeout = setTimeout(async () => {
          const timeoutError = rt.data
          if (record) {
            await this.recordFailed(timeoutError, apiRecord)
          }
          throw timeoutError
        }, apiTimeout)
        const resp = await returnPromise
        if (record) {
          this.recordSuccess(resp, apiRecord)
        }
        return resp
      } catch (e) {
        if (record) {
          await this.recordFailed(e, apiRecord)
        }
        throw e
      } finally {
        clearTimeout(timeout)
      }
    } else if (rt.status === 400) {
      const error = rt.data
      if (record) {
        await this.recordFailed(error, apiRecord)
      }
      throw error
    } else {
      throw rt
    }
  }
}

export interface CreateInspectionTaskActionParam {
  mnIp?: string
  hosts?: string[]
  subItems?: string[]
  exclusivehosts?: string[]
  version?: string
}

export interface CreateInspectionTaskResult {
  data?: any
  jobUuid?: string
}
