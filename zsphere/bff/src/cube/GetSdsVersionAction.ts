import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ActionBase } from '@/api/zstack/base/action-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZopsHttpService } from '@/common/trans/zs-http-service/zops-http-service.service'
import { genUuid } from '@/utils'

@Injectable()
export class GetSdsInfoAction extends ActionBase {
  @Inject() declare zopsHttpService: ZopsHttpService
  @Inject() declare webhookCallbackService: WebhookCallbackService

  async call(param: GetSdsInfoActionParam, _info: ActionInfo = {}): Promise<GetSdsInfoResult> {
    const info = _.cloneDeep(_info)
    if (!info.apiId) {
      info.apiId = genUuid()
    }
    const httpRequestPromise = this.zopsHttpService.post(
      `/actions/get-sds-formation-version`,
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
      try {
        timeout = setTimeout(async () => {
          const timeoutError = rt.data
          throw timeoutError
        }, apiTimeout)
        const resp = await returnPromise
        return resp
      } catch (e) {
        throw e
      } finally {
        clearTimeout(timeout)
      }
    } else {
      throw rt
    }
  }
}

export interface GetSdsInfoActionParam {
  monitorNodeIp: string
}

export interface GetSdsInfoResult {
  data?: {
    success: boolean
    sdsVersion: string
    isExpandPoolSupported: boolean
  }
  jobUuid?: string
}
