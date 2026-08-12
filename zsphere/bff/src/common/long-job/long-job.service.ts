import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { SubmitLongJobActionParam, SubmitLongJobAction } from '@/api/zstack/SubmitLongJobAction'
import { ActionTaskState } from '@/common/model/action.model'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { ZsLongJob } from '@/model/zs-long-job.model'
import { ZsSession } from '@/model/zs-session.model'

import { PubSubService } from '../pub-sub/pub-sub.service'

@Injectable()
export class LongJobService {
  @InjectModel(ZsLongJob) protected zsLongJob: typeof ZsLongJob
  @InjectModel(ZsSession) protected _zsSession: typeof ZsSession
  @Inject(CONTEXT) protected readonly _context
  @Inject() submitLongJobAction: SubmitLongJobAction
  @Inject() pubSubService: PubSubService
  @Inject() recordActionService: RecordActionService

  async callInAction(
    jobName: string,
    jobData: string,
    jobId: string,
    actionId: string,
    taskId: string,
    resourceType: string,
    name: string = jobName,
    description = '',
    targetResourceUuid?: string
  ) {
    const param: SubmitLongJobActionParam = {
      jobName,
      name,
      description,
      jobData,
      targetResourceUuid
    }
    const resp = await this.submitLongJobAction.call(param, {
      taskId,
      actionId,
      apiId: jobId
    })
    this.record(jobName, jobData, jobId, resp.inventory.uuid, resourceType)
  }

  async call(
    actionName: string,
    jobName: string,
    jobData: string,
    jobId: string,
    resourceType: string,
    name: string = jobName,
    description = '',
    recordTransform: (any) => any = val => val
  ) {
    await this.recordActionService.recordActionStart(jobData, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)
    const param: SubmitLongJobActionParam = {
      jobName,
      name,
      description,
      jobData
    }
    try {
      const resp = await this.submitLongJobAction.call(
        param,
        {
          taskId: jobId,
          actionId: jobId
        },
        true,
        recordTransform
      )
      this.record(jobName, jobData, jobId, resp.inventory.uuid, resourceType)
      return resp
    } catch (e) {
      await this.recordActionService.recordActionFailed(jobId)
      await this.recordActionService.recordTaskFailed(jobId)
      this.pubSubService.response({
        sessionId: this._context.req.headers['x-session-id'],
        id: jobId,
        actionId: jobId,
        state: ActionTaskState.fail,
        type: resourceType,
        error: JSON.stringify(e)
      })
    }
  }

  async record(jobName, jobData, clientJobUuid, longJobUuid, resourceType) {
    const sessionId = (this._context as any).req.headers['x-session-id']
    const currSession = await this._zsSession.findOne({
      where: { sessionId }
    })
    await this.zsLongJob.create({
      longJobUuid,
      // longJobUuid: rt?.inventory?.apiId,
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

  async oldrecord(jobName, jobData, longJobUuid) {
    const mainJobId = (this._context as any).req.headers['x-job-id']
    const sessionId = (this._context as any).req.headers['x-session-id']
    const currSession = await this._zsSession.findOne({
      where: { sessionId }
    })
    await this.zsLongJob.create({
      longJobUuid,
      clientJobUuid: mainJobId,
      jobName,
      data: jobData,
      progress: 0,
      state: 'RUNNING',
      userId: currSession.userId,
      createDate: new Date(),
      lastOpDate: new Date()
    })
  }
}
