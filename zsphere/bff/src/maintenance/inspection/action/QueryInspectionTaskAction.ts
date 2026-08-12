import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { QueryBase } from '@/api/zstack/base/query-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZopsHttpService } from '@/common/trans/zs-http-service/zops-http-service.service'
import { genUuid } from '@/utils/'

@Injectable()
export class QueryInspectionTaskAction extends QueryBase {
  @Inject() zopsHttpService: ZopsHttpService
  @Inject() declare webhookCallbackService: WebhookCallbackService

  async call(
    param: QueryInspectionTaskActionParam,
    _info: ActionInfo = {}
  ): Promise<QueryInspectionTaskResult> {
    const info = _.cloneDeep(_info)
    if (!info.apiId) {
      info.apiId = genUuid()
    }
    const httpRequestPromise = this.zopsHttpService.post(
      '/actions/inspection-task-detail',
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
      return rt.data
    } else if (rt.status === 202) {
      let timeout
      let resolve
      try {
        const pro = new Promise((_resolve, _reject) => {
          resolve = _resolve
          timeout = setTimeout(() => {
            rt.data.name = 'apiTimeOut'
            const timeoutError = rt.data
            _reject(timeoutError)
          }, apiTimeout)
        })
        const resp = await Promise.race([returnPromise, pro])
        return resp
      } catch (e) {
        throw e
      } finally {
        clearTimeout(timeout)
        resolve(timeout)
      }
    } else {
      throw rt
    }
  }
}

export interface QueryInspectionTaskActionParam {
  taskUuid: string
}

export interface QueryInspectionTaskResult {
  taskInfo?: any
  subItems?: any[]
  runtime?: number
  currentSubTask?: string
}
