import * as https from 'https'

import { HttpService } from '@nestjs/axios'
import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'
import { Op } from 'sequelize'

import { ActionTaskState } from '@/common/model/action.model'
import { PubSubServiceBase } from '@/common/pub-sub/pub-sub-base.service'
import { RecordActionServiceBase } from '@/common/record-action/record-action-base.service'
import { ZopsLongJob } from '@/model/zops-long-job.model'

import ErrorCatch from '../common/catch-decorate'
import { Logger } from '../common/logger/logger.decorator'
import { ZSLoggerService } from '../common/logger/logger.service'
import { ZsSession } from '../model/zs-session.model'
// import { QueryInspectionTaskActionBase } from '@/maintenance/inspection/action/QueryInspectionTaskActionBase';

const errorCatchGenerator = jobName => {
  return function (error, ctx) {
    const job = ctx.schedulerRegistry.getCronJob(jobName)
    ctx.logger.error(`${jobName} ${error}`)
    job.start()
  }
}

const ADMIN_UUID = '36c27e8ff05c4780bf6d2fa65700f22e'
@Injectable()
export class ZopsCronService {
  @Inject() private schedulerRegistry: SchedulerRegistry
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZopsLongJob) private zopsLongJob: typeof ZopsLongJob
  // @Inject() queryInspectionTaskAction: QueryInspectionTaskActionBase;
  @Inject() pubSubService: PubSubServiceBase
  @Inject() recordActionService: RecordActionServiceBase
  @Inject() configService: ConfigService
  @Inject() httpService: HttpService
  @Logger(ZopsCronService.name) logger: ZSLoggerService

  /***
   * detect does current node is the master node in double node mn
   * if no VIP, it's a single node. otherwise it is a double node
   */
  async activeNode() {
    try {
      const VIP = this.configService.get<string>('VIP')
      // single Node, do the cron
      if (!VIP) {
        return true
      }
      const nodeID = this.configService.get<string>('NODE_ID')
      const resp = await this.httpService
        .get(`${VIP}/api/nodeid`, {
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        })
        .toPromise()
      return nodeID === resp.data
    } catch (e) {
      this.logger.error('[activeNode error]', e)
      // by default, do the cron
      return true
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'refreshInspectionTaskJob'
  })
  @ErrorCatch(errorCatchGenerator('refreshInspectionTaskJob'))
  async refreshInspectionTaskJob() {
    // this.logger.timing('inspection task begin')
    // if (!this.ZOpsIsReady()) return
    // 判断是否是第一个node进程，用于多进程node场景
    if (parseInt(process.env.INSTANCE_ID) !== 0) {
      return
    }
    // 判断当前节点是否是vip，以防止操作了sql但是不通知前端
    const isVIP = await this.activeNode()
    if (!isVIP) {
      return
    }
    const job = this.schedulerRegistry.getCronJob('refreshInspectionTaskJob')
    job.stop() // 防止下面没做完，定时器又触发了
    const allLongJobs = await this.zopsLongJob.findAll({
      where: {
        state: {
          [Op.in]: ['INIT', 'RUNNING', 'SUSPENDED']
        }
      }
    })
    // this.logger.timing(allLongJobs)
    for (const longJob of allLongJobs) {
      const sessions = await this.zsSession.findAll({
        where: { userId: longJob.userId }
      })
      const adminSession = await this.zsSession.findOne({
        // 当admin用户登录时，需要查询到所有的longjob.若项目用户登录只查询自己创建的longjob即可。
        where: { userId: ADMIN_UUID }
      })
      const state = longJob.state
      const currSession = sessions[0] || adminSession
      const taskUuid = longJob.longJobUuid
      // try {
      //   const longJobResp = await this.queryInspectionTaskAction.call(
      //     { taskUuid },
      //     { sessionId: currSession.sessionId },
      //   );
      //   // this.logger.timing('after query logjob')
      //   this.logger.debug(longJobResp);
      //   let payload: any;
      //   const longJobInventory = longJobResp?.taskInfo ?? {};
      //   const isSucceeded = longJobInventory.status === 4;
      //   const isFailed = longJobInventory.status === 3;
      //   const isCanceled = longJobInventory.status === 5;
      //   const isSuspended = longJobInventory.status === 2;
      //   const isRunning = longJobInventory.status === 1;
      //   if (isSucceeded) {
      //     await this.zopsLongJob.update(
      //       { progress: 100, state: 'SUCCESS' },
      //       { where: { id: longJob.id } },
      //     );
      //     await this.recordActionService.recordActionSuccess(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordTaskSuccess(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordApiSuccess(
      //       longJob.clientJobUuid,
      //     );
      //     payload = {
      //       // id - 参照 action.model 文件的ActionTaskResult类型定义
      //       id: longJob.clientJobUuid,
      //       actionId: longJob.clientJobUuid,
      //       state: ActionTaskState.success,
      //       type: longJob.resourceType,
      //     };
      //   }
      //   // from running state to suspended state
      //   if (isSuspended && state === 'RUNNING') {
      //     await this.zopsLongJob.update(
      //       { state: 'SUSPENDED' },
      //       { where: { id: longJob.id } },
      //     );
      //     await this.recordActionService.recordActionSuspended(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordApiSuspended(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordTaskSuspended(
      //       longJob.clientJobUuid,
      //     );
      //     payload = {
      //       // id - 参照 action.model 文件的ActionTaskResult类型定义
      //       id: longJob.clientJobUuid,
      //       actionId: longJob.clientJobUuid,
      //       state: ActionTaskState.suspended,
      //       type: longJob.resourceType,
      //     };
      //   }
      //   // from suspended state to running state
      //   if (isRunning && state === 'SUSPENDED') {
      //     await this.zopsLongJob.update(
      //       { state: 'RUNNING' },
      //       { where: { id: longJob.id } },
      //     );
      //     await this.recordActionService.recordActionResume(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordApiResume(longJob.clientJobUuid);
      //     await this.recordActionService.recordTaskResume(
      //       longJob.clientJobUuid,
      //     );
      //     payload = {
      //       // id - 参照 action.model 文件的ActionTaskResult类型定义
      //       id: longJob.clientJobUuid,
      //       actionId: longJob.clientJobUuid,
      //       state: ActionTaskState.running,
      //       type: longJob.resourceType,
      //     };
      //   }

      //   if (isFailed) {
      //     await this.zopsLongJob.update(
      //       { progress: 0, state: 'FAILED' },
      //       { where: { id: longJob.id } },
      //     );
      //     await this.recordActionService.recordActionFailed(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordTaskFailed(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordApiFailed(longJob.clientJobUuid);
      //     payload = {
      //       // id - 参照 action.model 文件的ActionTaskResult类型定义
      //       id: longJob.clientJobUuid,
      //       actionId: longJob.clientJobUuid,
      //       state: ActionTaskState.fail,
      //       type: longJob.resourceType,
      //       error: JSON.stringify(longJobInventory.jobResult),
      //     };
      //   }

      //   if (isCanceled) {
      //     await this.zopsLongJob.update(
      //       { progress: 100, state: 'CANCELED' },
      //       { where: { id: longJob.id } },
      //     );
      //     await this.recordActionService.recordActionCanceled(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordTaskCanceled(
      //       longJob.clientJobUuid,
      //     );
      //     await this.recordActionService.recordApiCanceled(
      //       longJob.clientJobUuid,
      //     );
      //     payload = {
      //       // id - 参照 action.model 文件的ActionTaskResult类型定义
      //       id: longJob.clientJobUuid,
      //       actionId: longJob.clientJobUuid,
      //       state: ActionTaskState.fail,
      //       type: longJob.resourceType,
      //       error: JSON.stringify(longJobInventory.jobResult),
      //     };
      //   }
      //   if (isRunning && longJobResp?.taskInfo) {
      //     const progress = longJobResp.taskInfo.process;
      //     await this.zopsLongJob.update(
      //       { progress, state: 'RUNNING' },
      //       { where: { id: longJob.id } },
      //     );
      //   }
      //   if (payload) {
      //     for (const session of sessions) {
      //       const _payload = _.cloneDeep(payload);
      //       _payload.sessionId = session.sessionId;
      //       this.pubSubService.response(_payload);
      //     }
      //   }
      // } catch (e) {
      //   this.logger.error(e);
      //   await this.recordActionService.recordActionException(
      //     longJob.clientJobUuid,
      //   );
      //   await this.recordActionService.recordTaskException(
      //     longJob.clientJobUuid,
      //   );
      //   await this.recordActionService.recordApiFailed(longJob.clientJobUuid);
      //   await this.zopsLongJob.update(
      //     {
      //       progress: 100,
      //       state: 'FAILED',
      //       readStatus: 'READ',
      //     },
      //     { where: { id: longJob.id } },
      //   );
      //   const payload = {
      //     id: longJob.clientJobUuid,
      //     actionId: longJob.clientJobUuid,
      //     state: ActionTaskState.fail,
      //     type: longJob.resourceType,
      //     sessionId: '',
      //   };
      //   for (const session of sessions) {
      //     const _payload = _.cloneDeep(payload);
      //     _payload.sessionId = session.sessionId;
      //     this.pubSubService.response(_payload);
      //   }
      // }
    }
    job.start()
  }
}
