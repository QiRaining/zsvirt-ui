import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { SchedulerRegistry } from '@nestjs/schedule'
import { CronJob } from 'cron'
import { get as _get } from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { SubmitLongJobActionParam } from '@/api/zstack/SubmitLongJobAction'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import ZQL, { ZOp } from '@/common/zql/index'

export interface UploadTarget {
  artifactUuid: string
  uploadUrl: string
}

export type ResolveUploadTarget = (
  jobResult: Record<string, unknown>
) => Promise<UploadTarget | undefined> | UploadTarget | undefined

const ACTIVE_LONG_JOB_STATES = new Set(['Waiting', 'Running'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

@Injectable()
export class UploadPackageLongJobService extends LongJobService {
  @Inject() zqlService: ZQLService
  @Inject() queryLongJobAction: QueryLongJobAction
  @Inject() schedulerRegistry: SchedulerRegistry
  @Inject() pubsubService: PubSubService
  @Inject(CONTEXT) protected readonly _context

  sessionId: string
  result: Promise<any>

  /**
   * Override this in subclasses to provide a unique cron job name.
   * e.g. "storagePackageInterval" or "migrationPackageInterval"
   */
  protected get cronJobName(): string {
    throw new Error('Subclass must override cronJobName')
  }

  constructor() {
    super()
  }

  protected getCronJobName(longJobUuid: string): string {
    return `${this.cronJobName}:${longJobUuid}`
  }

  protected stopCronJob(cronJobName: string) {
    try {
      const job = this.schedulerRegistry.getCronJob(cronJobName)
      job.stop()
      this.schedulerRegistry.deleteCronJob(cronJobName)
    } catch {
      // Poll settlement can race with a final scheduled tick; cleanup is idempotent.
    }
  }

  protected async resolveSoftwarePackageUploadTarget(
    jobResult: Record<string, unknown>
  ): Promise<UploadTarget | undefined> {
    const inventory = jobResult.inventory
    if (!isRecord(inventory) || typeof inventory.uuid !== 'string' || !inventory.uuid) {
      return undefined
    }

    const zql = ZQL.stringify({
      tableName: 'systemTag',
      fields: ['resourceUuid', 'tag'],
      condition: {
        resourceType: 'SoftwarePackageVO',
        resourceUuid: inventory.uuid,
        tag: {
          [ZOp.like]: 'uploadUrl::%'
        }
      }
    })

    const { results } = await this.zqlService.call(zql)
    const uploadFileTag = _get(results, ['0', 'inventories', '0', 'tag'], '')
    if (typeof uploadFileTag !== 'string' || !uploadFileTag.startsWith('uploadUrl::')) {
      return undefined
    }

    return {
      artifactUuid: inventory.uuid,
      uploadUrl: uploadFileTag.slice('uploadUrl::'.length)
    }
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

  async interval(
    longJobUuid,
    cronJobName: string,
    resolve: (jobResult: string) => void,
    reject: (reason?: unknown) => void,
    resolveUploadTarget: ResolveUploadTarget
  ) {
    try {
      const longJobResp = await this.queryLongJobAction.call(
        { conditions: [{ key: 'apiId', value: longJobUuid }] },
        { sessionId: this.sessionId }
      )
      const inventory = longJobResp.inventories[0]

      if (inventory?.jobResult) {
        const parsedResult: unknown = JSON.parse(inventory.jobResult)
        if (!isRecord(parsedResult)) {
          throw new Error('Upload package long job returned an invalid job result')
        }
        const target = await resolveUploadTarget(parsedResult)
        if (target) {
          if (!target.artifactUuid || !target.uploadUrl || !inventory.uuid) {
            throw new Error('Upload package long job returned an invalid upload target')
          }
          this.stopCronJob(cronJobName)
          resolve(
            JSON.stringify({
              artifactUuid: target.artifactUuid,
              realUuid: inventory.uuid,
              uploadUrl: target.uploadUrl
            })
          )
          return
        }
      }

      if (inventory && !ACTIVE_LONG_JOB_STATES.has(inventory.state)) {
        this.stopCronJob(cronJobName)
        reject(
          new Error(
            `Upload package long job finished before the upload target was ready: ${inventory.state}`
          )
        )
      }
    } catch (error) {
      this.stopCronJob(cronJobName)
      reject(error)
    }
  }
  async customCall(
    actionName: string,
    jobName: string,
    jobData: string,
    jobId: string,
    url: string,
    resourceType: string,
    resolveUploadTarget?: ResolveUploadTarget
  ): Promise<any> {
    const isUpload = url.indexOf('upload://') === 0
    await this.recordActionService.recordActionStart(jobData, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)
    const hash = JSON.parse(jobData).hash
    const param: SubmitLongJobActionParam = {
      jobName,
      jobData
    }
    if (isUpload && hash) {
      param.systemTags = [`uploadSoftwarePackage::${hash}`]
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
      } else {
        const targetResolver =
          resolveUploadTarget ?? (jobResult => this.resolveSoftwarePackageUploadTarget(jobResult))
        const cronJobName = this.getCronJobName(resp.inventory.apiId)
        const promise = new Promise<string>((resolve, reject) => {
          const job = new CronJob(`*/1 * * * * *`, () => {
            void this.interval(resp.inventory.apiId, cronJobName, resolve, reject, targetResolver)
          })
          this.schedulerRegistry.addCronJob(cronJobName, job as any)
          job.start()
        })
        const jobResultStr = await promise

        result.jobResult = jobResultStr
        result.actionId = jobId
        result.transit = `${process.env.HOST}:${process.env.BASE_PORT}`
      }
      this.record(jobName, jobData, jobId, resp.inventory.uuid, resourceType)
      return result
    } catch (e) {
      await this.recordActionService.recordActionFailed(jobId)
      await this.recordActionService.recordTaskFailed(jobId)
      // 通过socket向前端抛出错误
      const payload = {
        state: ActionTaskState.fail,
        sessionId: this.sessionId,
        actionId: jobId,
        error: JSON.stringify(e)
      }
      this.pubSubService.response(payload)
    }
  }
}
