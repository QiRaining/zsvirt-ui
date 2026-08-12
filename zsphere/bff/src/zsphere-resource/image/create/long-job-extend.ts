import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { SchedulerRegistry } from '@nestjs/schedule'

import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { SubmitLongJobActionParam } from '@/api/zstack/SubmitLongJobAction'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'

@Injectable()
export default class LongJobExtend extends LongJobService {
  @Inject() queryLongJobAction: QueryLongJobAction
  @Inject() schedulerRegistry: SchedulerRegistry
  @Inject() pubsubService: PubSubService
  @Inject(CONTEXT) protected readonly _context

  sessionId: string
  result: Promise<any>

  constructor() {
    super()
    // this.sessionId = (this._context as any).req.headers['x-session-id']
  }

  async record(jobName, jobData, clientJobUuid, longJobUuid, resourceType): Promise<any> {
    this.sessionId = (this._context as any).req.headers['x-session-id']
    const currSession = await this._zsSession.findOne({
      where: { sessionId: this.sessionId }
    })
    await this.zsLongJob.create({
      longJobUuid,
      clientJobUuid,
      jobName,
      resourceType,
      data: jobData,
      progress: 0,
      state: 'RUNNING',
      userId: currSession.userId,
      createDate: new Date(),
      lastOpDate: new Date()
    })
  }

  async interval(longJobUuid, resolve: any) {
    const longJobResp = await this.queryLongJobAction.call(
      { conditions: [{ key: 'apiId', value: longJobUuid }] },
      { sessionId: this.sessionId }
    )
    if (longJobResp.inventories?.[0]?.jobResult) {
      const job = this.schedulerRegistry.getCronJob('imageInterval')
      job.stop()
      this.schedulerRegistry.deleteCronJob('imageInterval')
      let result = longJobResp.inventories[0].jobResult
      result = JSON.parse(result)
      result.realUuid = longJobResp.inventories[0].uuid
      resolve(JSON.stringify(result))
    }
    if (longJobResp.inventories[0] && longJobResp.inventories[0].state !== 'Running') {
      const job = this.schedulerRegistry.getCronJob('imageInterval')
      job.stop()
      this.schedulerRegistry.deleteCronJob('imageInterval')
    }
  }

  async pollLongJobStatus(apiId: string, jobId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let pollCount = 0
      const maxPolls = 360 // 最多轮询 30 分钟（每5秒一次）

      const pollInterval = setInterval(async () => {
        try {
          pollCount++
          console.log(`Polling long job status (${pollCount}/${maxPolls}) for apiId: ${apiId}`)

          const longJobResp = await this.queryLongJobAction.call(
            { conditions: [{ key: 'apiId', value: apiId }] },
            { sessionId: this.sessionId }
          )

          const jobData = longJobResp.inventories?.[0]

          if (!jobData) {
            console.log('Long job not found, stopping poll')
            clearInterval(pollInterval)
            // 通过 recordActionService 记录任务失败
            await this.recordActionService.recordActionFailed(jobId)
            await this.recordActionService.recordTaskFailed(jobId)
            reject(new Error('Long job not found'))
            return
          }

          console.log('Long job state:', jobData.state, 'jobResult:', !!jobData.jobResult)

          // 如果任务成功完成且有结果
          if (jobData.jobResult) {
            let result = jobData.jobResult
            result = JSON.parse(result)
            result.realUuid = jobData.uuid

            resolve(JSON.stringify(result))
          }

          // 如果任务完成但状态不是 Running（包括 Succeeded, Failed, Canceled 等）
          if (jobData.state !== 'Running') {
            console.log('Long job finished with state:', jobData.state, 'stopping poll')
            clearInterval(pollInterval)

            // 如果任务成功但没有 jobResult，返回基本信息
            if (jobData.state === 'Succeeded') {
              const result = {
                realUuid: jobData.uuid,
                state: jobData.state,
                message: 'Task completed successfully'
              }

              // 通过 recordActionService 记录任务成功
              await this.recordActionService.recordActionSuccess(jobId)
              await this.recordActionService.recordTaskSuccess(jobId)

              // 通知前端任务成功完成
              this.pubSubService.response({
                state: ActionTaskState.success,
                sessionId: this.sessionId,
                actionId: jobId,
                type: 'Image',
                result: JSON.stringify(result)
              })

              resolve(JSON.stringify(result))
            } else {
              // 通过 recordActionService 记录任务失败
              await this.recordActionService.recordActionFailed(jobId)
              await this.recordActionService.recordTaskFailed(jobId)

              // 通知前端任务失败
              this.pubSubService.response({
                state: ActionTaskState.fail,
                sessionId: this.sessionId,
                actionId: jobId,
                type: 'Image',
                error: JSON.stringify({
                  message: `Long job failed with state: ${jobData.state}`
                })
              })

              reject(new Error(`Long job failed with state: ${jobData.state}`))
            }
            return
          }

          // 如果达到最大轮询次数，停止轮询
          if (pollCount >= maxPolls) {
            console.log('Max poll count reached, stopping poll')
            clearInterval(pollInterval)

            // 通过 recordActionService 记录任务失败
            await this.recordActionService.recordActionFailed(jobId)
            await this.recordActionService.recordTaskFailed(jobId)

            // 通知前端任务超时
            this.pubSubService.response({
              state: ActionTaskState.fail,
              sessionId: this.sessionId,
              actionId: jobId,
              type: 'Image',
              error: JSON.stringify({ message: 'Long job polling timeout' })
            })

            reject(new Error('Long job polling timeout'))
            return
          }
        } catch (error) {
          console.error('Error polling long job status:', error)
          clearInterval(pollInterval)
          // 通过 recordActionService 记录任务失败
          await this.recordActionService.recordActionFailed(jobId)
          await this.recordActionService.recordTaskFailed(jobId)

          // 通知前端任务失败
          this.pubSubService.response({
            state: ActionTaskState.fail,
            sessionId: this.sessionId,
            actionId: jobId,
            type: 'Image',
            error: JSON.stringify(error)
          })

          reject(error)
        }
      }, 5000) // 每5秒检查一次
    })
  }

  async customCall(
    actionName: string,
    jobName: string,
    jobData: string,
    jobId: string,
    url: string,
    resourceType: string
  ): Promise<any> {
    const isUpload = url.indexOf('upload://') === 0
    await this.recordActionService.recordActionStart(jobData, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)
    const hash = JSON.parse(jobData).hash
    const param: SubmitLongJobActionParam = {
      jobName,
      jobData
    }
    if (isUpload) {
      param.systemTags = [`uploadImage::${hash}`]
    }
    try {
      this.sessionId = (this._context as any).req.headers['x-session-id']
      const resp = await this.submitLongJobAction.call(param, {
        taskId: jobId,
        actionId: jobId
      })

      const result: {
        actionId?: string
        jobResult?: string
        transit?: string
      } = {}
      if (!isUpload) {
        result.actionId = jobId
        await this.pollLongJobStatus(resp.inventory.apiId, jobId)
      } else {
        // 对于上传任务，使用轮询机制主动检查 long job 状态
        const jobResult = await this.pollLongJobStatus(resp.inventory.apiId, jobId)
        result.jobResult = jobResult
        result.actionId = jobId
        result.transit = `${process.env.HOST}:${process.env.BASE_PORT}`
        // 轮询方法内部已经通过 recordActionService 记录了状态，这里不需要重复处理
      }
      this.record(jobName, jobData, jobId, resp.inventory.uuid, resourceType)
      return result
    } catch (e) {
      await this.recordActionService.recordActionFailed(jobId)
      await this.recordActionService.recordTaskFailed(jobId)

      // 通过socket向前端抛出错误
      this.pubSubService.response({
        state: ActionTaskState.fail,
        sessionId: this.sessionId,
        actionId: jobId,
        type: resourceType,
        error: JSON.stringify(e)
      })
      throw e // 重新抛出错误，确保方法正确结束
    }
  }
}
