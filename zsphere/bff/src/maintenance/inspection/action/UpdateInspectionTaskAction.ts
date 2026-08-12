import { Injectable, Inject } from '@nestjs/common'
import * as _ from 'lodash'

import { ActionBase } from '@/api/zstack/base/action-base'
import { ActionInfo } from '@/api/zstack/base/types'
import { WebhookCallbackService } from '@/api/zstack/base/webhook-callback.service'
import { ZopsHttpService } from '@/common/trans/zs-http-service/zops-http-service.service'
import { genUuid } from '@/utils'

@Injectable()
export class UpdateInspectionTaskAction extends ActionBase {
  @Inject() zopsHttpService: ZopsHttpService
  @Inject() declare webhookCallbackService: WebhookCallbackService

  async call(
    param: UpdateInspectionTaskActionParam,
    _info: ActionInfo = {},
    record = true
  ): Promise<UpdateInspectionTaskResult> {
    const info = _.cloneDeep(_info)
    if (!info.apiId) {
      info.apiId = genUuid()
    }
    let apiRecord: any
    if (record) {
      apiRecord = await this.recordStart(param, info, UpdateInspectionTaskAction.name)
    }
    // 后端分为两个接口，前端合并为一个
    // 暂停和取消
    // path: /actions/inspection-task-status
    // taskUuid string //  必填 你要改变状态的巡检任务uuid
    // status Int //必填  你要改变的任务状态，支持 2 暂停  5 取消
    // 恢复
    // path: /actions/inspection-task
    // jobUuid string //  必填 你要重新启动的任务uuid
    const { taskUuid, state } = param
    let path = ''
    let parseParam = {}
    switch (state) {
      case 'RUNNING':
        path = '/actions/inspection-task'
        parseParam = {
          jobUuid: taskUuid
        }
        break
      case 'SUSPENDED':
        path = '/actions/inspection-task-status'
        parseParam = {
          taskUuid,
          status: 2
        }
        break
      case 'CANCELED':
        path = '/actions/inspection-task-status'
        parseParam = {
          taskUuid,
          status: 5
        }
        break
      default:
        break
    }
    const httpRequestPromise = this.zopsHttpService.post(
      path,
      parseParam,
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

export interface UpdateInspectionTaskActionParam {
  taskUuid: string
  state: 'RUNNING' | 'CANCELED' | 'SUSPENDED'
}

export interface UpdateInspectionTaskResult {
  data?: any
}
