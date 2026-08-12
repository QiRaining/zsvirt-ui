import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { SubmitLongJobAction, SubmitLongJobActionParam } from '@/api/zstack/SubmitLongJobAction'
import { Logger } from '@/common/logger/logger.decorator'
import type { ZSLoggerService } from '@/common/logger/logger.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { genUuid } from '@/utils'

import type { UploadJobRetryResult, UploadSessionDto } from './upload-session.service'

@Injectable()
export class UploadJobRetryService {
  constructor(
    private readonly submitLongJobAction: SubmitLongJobAction,
    private readonly recordActionService: RecordActionService,
    @InjectModel(ZsLongJob)
    private readonly zsLongJobModel: typeof ZsLongJob
  ) {}

  @Logger(UploadJobRetryService.name)
  private readonly logger?: ZSLoggerService

  async recreateUploadJob(session: UploadSessionDto): Promise<UploadJobRetryResult> {
    if (!session.sessionId || !session.jobName || !session.jobData) {
      this.logUploadResume('retry-job-recreate-refused', {
        oldLongJobUuid: session.longJobUuid,
        uploadType: session.uploadType,
        status: session.status,
        hasSessionId: Boolean(session.sessionId),
        hasJobName: Boolean(session.jobName),
        hasJobData: Boolean(session.jobData)
      })
      throw new BadRequestException('Upload session is missing original long job payload')
    }

    const actionId = genUuid()
    const actionName = session.actionName ?? session.jobName
    const resourceType = session.resourceType ?? this.getDefaultResourceType(session.uploadType)
    const param: SubmitLongJobActionParam = {
      jobName: session.jobName,
      jobData: session.jobData,
      systemTags: this.getUploadSystemTags(session)
    }
    const req = {
      headers: {
        'x-session-id': session.sessionId,
        'x-job-id': actionId
      }
    }

    this.logUploadResume('retry-job-submit', {
      oldLongJobUuid: session.longJobUuid,
      actionId,
      jobName: session.jobName,
      actionName,
      resourceType,
      uploadType: session.uploadType,
      status: session.status,
      retryCount: session.retryCount,
      maxRetryCount: session.maxRetryCount,
      rootSessionId: session.rootSessionId,
      replacedFromLongJobUuid: session.replacedFromLongJobUuid,
      previousLongJobUuid: session.previousLongJobUuid,
      systemTagCount: param.systemTags.length
    })

    await this.recordActionService.recordActionStart(session.jobData, actionId, actionName, { req })
    await this.recordActionService.recordTaskStart(actionId, actionId)

    try {
      const resp = await this.submitLongJobAction.call(
        param,
        {
          sessionId: session.sessionId,
          taskId: actionId,
          actionId
        },
        true
      )
      const longJobUuid = resp.inventory?.uuid ?? resp.inventory?.apiId

      this.logUploadResume('retry-job-submit-result', {
        oldLongJobUuid: session.longJobUuid,
        actionId,
        newLongJobUuid: longJobUuid,
        inventoryState: resp.inventory?.state,
        hasUuid: Boolean(longJobUuid)
      })

      if (!longJobUuid) {
        throw new BadRequestException('Recreated upload long job did not return uuid')
      }

      await this.zsLongJobModel.create({
        longJobUuid,
        clientJobUuid: actionId,
        jobName: session.jobName,
        resourceType,
        data: session.jobData,
        progress: 0,
        state: 'RUNNING',
        userId: session.userUuid,
        createDate: new Date(),
        lastOpDate: new Date()
      } as ZsLongJob)

      this.logUploadResume('retry-job-recorded', {
        oldLongJobUuid: session.longJobUuid,
        actionId,
        newLongJobUuid: longJobUuid,
        jobName: session.jobName,
        resourceType
      })

      return {
        longJobUuid
      }
    } catch (error) {
      this.logUploadResume('retry-job-submit-failed', {
        oldLongJobUuid: session.longJobUuid,
        actionId,
        jobName: session.jobName,
        errorReason: this.stringifyLogError(error)
      })
      await this.recordActionService.recordActionFailed(actionId)
      await this.recordActionService.recordTaskFailed(actionId)
      throw error
    }
  }

  private getUploadSystemTags(session: UploadSessionDto): string[] {
    if (session.uploadType === 'image') {
      return [`uploadImage::${session.hash}`]
    }
    return [`uploadSoftwarePackage::${session.hash}`]
  }

  private getDefaultResourceType(uploadType: UploadSessionDto['uploadType']): string {
    if (uploadType === 'image') {
      return 'Image'
    }
    return 'ThirdPartyStorage'
  }

  private stringifyLogError(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message.slice(0, 500)
    }
    if (typeof error === 'string' && error) {
      return error.slice(0, 500)
    }
    return 'Failed to recreate upload job'
  }

  private logUploadResume(stage: string, payload: Record<string, unknown>): void {
    this.logger?.debugJson({
      type: 'uploadResume',
      stage,
      ...payload
    })
  }
}
