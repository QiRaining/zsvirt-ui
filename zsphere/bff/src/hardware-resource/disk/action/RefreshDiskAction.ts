import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ActionBase } from '@/api/zstack/base/action-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZsHttpService } from '@/common/trans/zs-http-service/zs-http-service.service'
import { genUuid } from '@/utils'

@Injectable()
export class RefreshDiskAction extends ActionBase {
  @Inject() declare zsHttpService: ZsHttpService
  @Inject() declare webhookCallbackService: WebhookCallbackService

  async call(
    param: RefreshDiskActionParam,
    _info: ActionInfo = {},
    record = true
  ): Promise<RefreshDiskResult> {
    const info = _.cloneDeep(_info)
    if (!info.apiId) {
      info.apiId = genUuid()
    }
    let apiRecord: any
    if (record) {
      apiRecord = await this.recordStart(param, info, RefreshDiskAction.name)
    }
    const httpRequestPromise = this.zsHttpService.put(
      `/storage-devices/local-raid/actions`,
      {
        refreshLocalRaid: param,
        systemTags: param.systemTags
      },
      info
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
    } else {
      throw rt
    }
  }
}

export interface RefreshDiskActionParam {
  hostUuid: string
  systemTags?: any[]
  userTags?: any[]
  sessionId?: any
  accessKeyId?: any
  accessKeySecret?: any
  requestIp?: any
  timeout?: number
}

export interface RefreshDiskResult {
  inventories?: any[]
}
