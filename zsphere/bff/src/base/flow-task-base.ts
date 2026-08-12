import { Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import * as Bluebird from 'bluebird'
// import { TaskResponseService } from '../common/action-subscription/task-response.service'
import { TaskResource } from 'src/common/model/action-resp.model'

import { PubSubService } from '@/common/pub-sub/pub-sub.service'

import { FlowInstanceService } from '../common/flow/flow-instance/flow-instance.service'
import { FlowManagerService } from '../common/flow/flow-manager/flow-manager.service'
export abstract class FlowTaskBase {
  protected name = 'FlowTaskBase'
  @Inject(CONTEXT) private readonly context
  // @Inject() taskResponseService: TaskResponseService
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() flowManagerService: FlowManagerService
  @Inject() pubSubService: PubSubService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async invoke(task): Promise<any> {
    // await this.taskInfoService.update({ startDate: new Date().getTime() }, { where: { taskId: taskInfo.taskId } });
    // this.ctx.logger.info(`FlowTask: ${taskInfo.service} invoke.`);
    console.log(`FlowTask: ${task.service} invoke.`)
    if (task?.config?.test) {
      if (task?.config?.test?.abortBefore) {
        throw Error(`${this.name} exception!`)
      }
      if (task?.config?.test?.timeBefore) {
        await Bluebird.delay(task.config.test.timeBefore)
      }
    }
    let result
    const taskResources: TaskResource[] = []
    try {
      result = await this.action(task, taskResources)
      await this.flowInstanceService.setResult(result, task.taskId, task.mainJobId)
      // await this.taskResponseService.response(task.mainJobId, {
      //   taskName: task.service,
      //   resources: taskResources
      // })
    } catch (e) {
      await this.flowInstanceService.setResult(e, task.taskId, task.mainJobId)
      // await this.taskResponseService.response(
      //   task.mainJobId,
      //   {
      //     taskName: task.service,
      //     resources: taskResources
      //   },
      //   e
      // )
      throw e
    }
    if (task?.config?.test) {
      if (task?.config?.test?.abortAfter) {
        throw Error(`${this.name} exception!`)
      }
      if (task?.config?.test?.timeAfter) {
        await Bluebird.delay(task?.config?.test?.timeAfter)
      }
    }
    // await this.taskInfoService.update({ result, endDate: new Date().getTime() }, { where: { taskId: taskInfo.taskId } });
    return result
  }

  abstract action(task, taskResources: TaskResource[]): Promise<any>

  async frameworkRollback(task, isRedo) {
    // task 可能会被覆盖先把 mainJobId 拿出来。因为这个是不存数据库的。
    const mainJobId = task.mainJobId
    await this.flowManagerService.setRollingbackAndSave(task, mainJobId)
    await this.rollback(task, isRedo)
    await this.flowManagerService.setRolledbackAndSave(task, mainJobId)

    // allowAbort = false
    // // console.log(`FlowTask: ${this.name} rollback!`);
    // // await this.rollback(taskInfo, isRedo);
    // const invoke = async () => {
    //   await this.rollback(task, isRedo);
    // };
    // let p;
    // if (allowAbort) {
    //   p = invoke();
    // } else {
    //   // https://stackoverflow.com/questions/44158629/get-bluebird-promise-from-async-await-functions
    //   p = Bluebird.method(invoke)();
    // }
    // if (allowAbort) {
    //   return p;
    // }
    // return p.reflect();
  }

  async rollback(taskInfo, isRedo) {
    return false
  }
}
