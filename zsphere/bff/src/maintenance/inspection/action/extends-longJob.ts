import { Inject, Injectable } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ValidateSessionAction } from '@/api/zstack/ValidateSessionAction'
import { ActionTaskState } from '@/common/model/action.model'
import { PubSubService } from '@/common/pub-sub/pub-sub.service'
import { RecordActionService } from '@/common/record-action/record-action.service'
import { ZopsLongJob } from '@/model/zops-long-job.model'
import { ZsSession } from '@/model/zs-session.model'

import {
  CreateInspectionTaskAction,
  CreateInspectionTaskActionParam
} from './CreateInspectionTaskAction'

@Injectable()
export default class ExtendsLongJob {
  @InjectModel(ZopsLongJob) protected zopsLongJob: typeof ZopsLongJob
  @InjectModel(ZsSession) protected zsSession: typeof ZsSession
  @Inject(CONTEXT) protected readonly context
  @Inject() createInspectionTaskAction: CreateInspectionTaskAction
  @Inject() pubSubService: PubSubService
  @Inject() recordActionService: RecordActionService
  @Inject() validateSessionAction: ValidateSessionAction

  async call(
    actionName: string,
    longJobName: string,
    jobId: string,
    resourceType: string,
    param: CreateInspectionTaskActionParam
  ): Promise<any> {
    const sessionId = this.context.req.headers['x-session-id']
    const rt = await this.validateSessionAction.call({
      sessionUuid: sessionId
    })
    if (!rt.valid) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    await this.recordActionService.recordActionStart(param, jobId, actionName)
    await this.recordActionService.recordTaskStart(jobId, jobId)
    try {
      const { data, jobUuid } = await this.createInspectionTaskAction.call(param, {
        taskId: jobId,
        actionId: jobId
      })
      this.record(longJobName, data, jobId, jobUuid, resourceType)
    } catch (e) {
      await this.recordActionService.recordActionFailed(jobId)
      await this.recordActionService.recordTaskFailed(jobId)
      this.pubSubService.response({
        sessionId,
        id: jobId,
        actionId: jobId,
        state: ActionTaskState.fail,
        type: resourceType,
        error: JSON.stringify(e)
      })
    }
  }

  async record(jobName, jobData, clientJobUuid, longJobUuid, resourceType) {
    const sessionId = (this.context as any).req.headers['x-session-id']
    const currSession = await this.zsSession.findOne({
      where: { sessionId }
    })
    await this.zopsLongJob.create({
      longJobUuid,
      clientJobUuid,
      jobName,
      resourceType,
      data: jobData,
      progress: 0,
      state: 'INIT',
      userId: currSession.userId,
      createDate: new Date(),
      lastOpDate: new Date(),
      readStatus: 'UNREAD'
    })
  }
}
