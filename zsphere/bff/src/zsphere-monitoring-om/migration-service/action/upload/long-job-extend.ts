import { Injectable } from '@nestjs/common'
import { CronJob } from 'cron'

import { SubmitLongJobActionParam } from '@/api/zstack/SubmitLongJobAction'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ActionTaskState } from '@/common/model/action.model'
import {
  ResolveUploadTarget,
  UploadPackageLongJobService
} from '@/common/upload-package/upload-package-long-job.service'

const ERROR_SERIALIZATION_FALLBACK =
  '{"message":"Unable to serialize migration LongJob error"}'

const serializeErrorSafely = (error: unknown): string | undefined => {
  try {
    return JSON.stringify(error) ?? ERROR_SERIALIZATION_FALLBACK
  } catch {
    return ERROR_SERIALIZATION_FALLBACK
  }
}

@Injectable()
export default class LongJobExtend extends UploadPackageLongJobService {
  @Logger(LongJobExtend.name) private logger: ZSLoggerService

  protected get cronJobName(): string {
    return 'migrationPackageInterval'
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
    const isUpload = url.startsWith('upload://')
    await this.recordActionService.recordActionStart(jobData, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)

    const hash = JSON.parse(jobData).hash
    const param: SubmitLongJobActionParam = { jobName, jobData }
    if (isUpload && hash) {
      param.systemTags = [`uploadSoftwarePackage::${hash}`]
    }

    try {
      this.sessionId = (this._context as any).req.headers['x-session-id']
      const response = await this.submitLongJobAction.call(param, {
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
          resolveUploadTarget ?? (value => this.resolveSoftwarePackageUploadTarget(value))
        const cronJobName = this.getCronJobName(response.inventory.apiId)
        result.jobResult = await new Promise<string>((resolve, reject) => {
          const job = new CronJob(`*/1 * * * * *`, () => {
            void this.interval(
              response.inventory.apiId,
              cronJobName,
              resolve,
              reject,
              targetResolver
            )
          })
          this.schedulerRegistry.addCronJob(cronJobName, job as any)
          job.start()
        })
        result.actionId = jobId
        result.transit = `${process.env.HOST}:${process.env.BASE_PORT}`
      }

      await this.record(jobName, jobData, jobId, response.inventory.uuid, resourceType)
      return result
    } catch (error) {
      const payload = {
        state: ActionTaskState.fail,
        sessionId: this.sessionId,
        actionId: jobId,
        error: serializeErrorSafely(error)
      }
      const failureSideEffects = [
        {
          name: 'recordActionFailed',
          run: () => this.recordActionService.recordActionFailed(jobId)
        },
        {
          name: 'recordTaskFailed',
          run: () => this.recordActionService.recordTaskFailed(jobId)
        },
        {
          name: 'publishFailure',
          run: () =>
            this.pubSubService.get().publish(payload.sessionId, { listenActionResp: payload })
        }
      ]

      for (const sideEffect of failureSideEffects) {
        try {
          await sideEffect.run()
        } catch (secondaryError) {
          try {
            this.logger.error(
              `Migration package long job ${sideEffect.name} failed for action ${jobId}`,
              secondaryError instanceof Error ? secondaryError.stack : String(secondaryError)
            )
          } catch {
            // Failure diagnostics must never replace the original migration LongJob error.
          }
        }
      }

      throw error
    }
  }
}
