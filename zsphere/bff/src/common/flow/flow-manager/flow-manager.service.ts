import { Injectable, Inject } from '@nestjs/common'
import * as Bluebird from 'bluebird'
import * as _ from 'lodash'

import { genUuid } from '../../../utils'
import FlowConst from '../const'
import { FlowInstanceService } from '../flow-instance/flow-instance.service'
import { FlowTask, FlowTaskState } from '../type'

const TIME_1_DAY = 24 * 60 * 60 * 1000

@Injectable()
export class FlowManagerService {
  @Inject() flowInstanceService: FlowInstanceService
  private serviceMap: any = {}

  initServices(serviceMap) {
    this.serviceMap = serviceMap
  }

  getService(serviceName) {
    return this.serviceMap[serviceName]
  }

  generateFlow(rawRootTask, mainJobId) {
    const rootTask = this.walkGenerateFlow(rawRootTask)
    rootTask.taskId = mainJobId
    return rootTask
  }

  walkGenerateFlow(rawFlow) {
    const internalTask: FlowTask = {
      taskId: genUuid(),
      service: rawFlow.service,
      state: rawFlow.state ? rawFlow.state : 'READY'
    }
    if (rawFlow.config !== undefined) {
      internalTask.config = rawFlow.config
    }
    if (rawFlow.input !== undefined) {
      internalTask.input = rawFlow.input
    }
    if (rawFlow.service === 'serialFlow') {
      if (!internalTask.config) {
        internalTask.config = {}
      }
      // 串行任务默认不隔离错误，出错即中断
      if (internalTask.config.isolateError === undefined) {
        internalTask.config.isolateError = false
      }
      internalTask.children = []
      for (const subTask of rawFlow.children) {
        const currTask = this.walkGenerateFlow(subTask)
        internalTask.children.push(currTask)
      }
    } else if (rawFlow.service === 'parallelFlow') {
      if (!internalTask.config) {
        internalTask.config = {}
      }
      // 并行任务默认隔离错误，出错不中断
      if (internalTask.config.isolateError === undefined) {
        internalTask.config.isolateError = true
      }
      internalTask.children = []
      for (const subTask of rawFlow.children) {
        const currTask = this.walkGenerateFlow(subTask)
        internalTask.children.push(currTask)
      }
    }
    return internalTask
  }

  async setRunningAndSave(task, mainJobId) {
    let rt
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      task = this.flowInstanceService.getTaskByIdFromRoot(task.taskId, rootTask)
      const newTask = this.setRunning(task)
      rt = {
        task: newTask,
        rootTask
      }
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    return rt
  }

  setRunning(task: FlowTask) {
    // 因为可能是重做的flow，所以有可能有 ABORTED 或者 STOPPING
    const canRun = {
      [FlowConst.state.READY]: true,
      [FlowConst.state.RUNNING]: true,
      [FlowConst.state.ABORTED]: true,
      [FlowConst.state.STOPPING]: true,
      [FlowConst.state.STOPPED]: true
    }
    if (canRun[task.state]) {
      task.state = FlowConst.state.RUNNING as FlowTaskState.RUNNING
    }
    if (task.service === FlowConst.flow.SERIAL) {
      for (const subTask of task.children) {
        if (canRun[subTask.state]) {
          this.setRunning(subTask)
          // 只能设能运行的第一个，就必须 break;
          break
        }
      }
    } else if (task.service === FlowConst.flow.PARALLEL) {
      for (const subTask of task.children) {
        this.setRunning(subTask)
      }
    }
    return task
  }

  async run(task, mainJobId, options) {
    // 1 day
    let timeout = TIME_1_DAY
    let allowAbort = true
    if (options.timeout !== undefined) {
      timeout = options.timeout
    }
    if (options.allowAbort !== undefined) {
      allowAbort = options.allowAbort
    }
    let rootTask = await this.generateFlow(task, mainJobId)
    rootTask = this.setRunning(rootTask)
    await this.flowInstanceService.create(rootTask, mainJobId)
    return this.runTask(rootTask, false, allowAbort, timeout)
  }

  async redo(mainJobId, options = undefined) {
    // 1 day
    let timeout = TIME_1_DAY
    let allowAbort = true
    if (options && options.timeout !== undefined) {
      timeout = options.timeout
    }
    if (options && options.allowAbort !== undefined) {
      allowAbort = options.allowAbort
    }
    const rootTask = await this.flowInstanceService.getRootTask(mainJobId)
    const rt = await this.setRunningAndSave(rootTask, mainJobId)
    return this.runTask(rt.rootTask, true, allowAbort, timeout)
  }

  async runTask(rootTask, isRedo = false, allowAbort = true, timeout = TIME_1_DAY) {
    const isEndedState = {
      [FlowConst.state.FINISHED]: true,
      [FlowConst.state.CANCELED]: true,
      [FlowConst.state.ROLLEDBACK]: true
    }
    const isRunningStates = {
      [FlowConst.state.READY]: true,
      [FlowConst.state.RUNNING]: true
    }
    const isRollbackStates = {
      [FlowConst.state.ROLLINGBACK]: true,
      [FlowConst.state.STOPPING]: true,
      [FlowConst.state.ABORTED]: true
    }
    if (isEndedState[rootTask.state]) {
      return
    } else if (isRunningStates[rootTask.state]) {
      try {
        await this.serviceInvoke(rootTask, rootTask.taskId, isRedo)
        // 如果只有单个任务，就这里处理成功
        if (
          rootTask.service !== FlowConst.flow.SERIAL &&
          rootTask.service !== FlowConst.flow.PARALLEL
        ) {
          await this.setFinishedAndSave(rootTask, rootTask.mainJobId)
        }
      } catch (error) {
        // 如果只有单个任务，就这里处理异常
        // 因为 ParallelFlow 如果有两个以上的 exception 到这里只有一个exception
        // 会漏掉一个 exception。 因此本框架都靠近处理异常了。不在这里总处理了。
        if (
          rootTask.service !== FlowConst.flow.SERIAL &&
          rootTask.service !== FlowConst.flow.PARALLEL
        ) {
          await this.flowInstanceService.safeUpdate(async (flow, mutex) => {
            const newTask = this.setAborted(rootTask, rootTask)
            await this.flowInstanceService.update(
              {
                flow: newTask,
                state: newTask.state
              },
              flow.id,
              mutex
            )
          }, rootTask.taskId)
        }
        throw error
      }
    } else if (isRollbackStates[rootTask.state]) {
      // await this.rollbackTask(rootTaskInfo);
    }
  }

  async setFinishedAndSave(task, mainJobId) {
    let rt
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      const newTask = this.setFinished(task, rootTask)
      rt = {
        task: newTask,
        rootTask
      }
      await this.flowInstanceService.update(
        {
          flow: newTask,
          state: newTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    return rt
  }

  setFinished(task, rootTask) {
    const isEndedState = {
      [FlowConst.state.FINISHED]: true,
      [FlowConst.state.ABORTED]: true,
      [FlowConst.state.STOPPED]: true
    }
    const taskChain = this.flowInstanceService.getTaskChainToRoot(task.taskId, rootTask)
    for (const currTaskInfo of taskChain) {
      if (currTaskInfo.service === FlowConst.flow.PARALLEL) {
        const subTasks = currTaskInfo.children
        const endedSubTaskCount = subTasks.filter(t => isEndedState[t.state]).length
        if (endedSubTaskCount === subTasks.length) {
          // 必须要加条件 state: 'RUNNING', 是为了保证在异步条件下的正确性。只能从 RUNNING 变到 FINISHED
          if (currTaskInfo.state === FlowConst.state.RUNNING) {
            currTaskInfo.state = FlowConst.state.FINISHED
          }
        } else {
          // 没到都到结束状态，状态不改变就不要再往上找了。要 break 掉
          break
        }
      } else if (currTaskInfo.service === FlowConst.flow.SERIAL) {
        const subTasks = currTaskInfo.children
        const finishedSubTasks = subTasks.filter(t => t.state === FlowConst.state.FINISHED)
        // 如果有 ABORTED 整明直接下面有任务打断了整个链。
        const abortedSubTasks = subTasks.filter(t => t.state === FlowConst.state.ABORTED)
        // 如果有 STOPPED 整明直接下面有任务打断了整个链。
        const stoppedSubTasks = subTasks.filter(t => t.state === FlowConst.state.STOPPED)
        if (
          finishedSubTasks.length === subTasks.length ||
          abortedSubTasks.length > 0 ||
          stoppedSubTasks.length > 0
        ) {
          // 必须要加条件 state: 'RUNNING', 是为了保证在异步条件下的正确性。只能从 RUNNING 变到 FINISHED
          if (currTaskInfo.state === FlowConst.state.RUNNING) {
            currTaskInfo.state = FlowConst.state.FINISHED
          }
        } else {
          // 如果这个时候状态不改变就不要再往上找了。要 break 掉
          break
        }
      } else {
        // 普通任务节点的处理
        // 必须要加条件 state: 'RUNNING', 是为了保证在异步条件下的正确性。
        // 只能从 RUNNING 变到 FINISHED, 从 STOPPING 到 STOPPED
        if (currTaskInfo.state === FlowConst.state.RUNNING) {
          currTaskInfo.state = FlowConst.state.FINISHED
        } else if (currTaskInfo.state === FlowConst.state.STOPPING) {
          currTaskInfo.state = FlowConst.state.STOPPED
        }
      }
    }
    return rootTask
  }

  async setAbortedAndSave(abortedTask, mainJobId) {
    let rt
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      const newAbortedTask = this.setAborted(abortedTask, rootTask)
      rt = {
        task: newAbortedTask,
        rootTask
      }
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    return rt
  }

  setAborted(abortedTask, rootTask) {
    const taskChain = this.flowInstanceService.getTaskChainToRoot(abortedTask.taskId, rootTask)
    let setAbortRootTask
    let setAbortRootParentTask
    // 如果有并行容器或者串行容器设置了错误隔离
    // 那么就应该从它下一级的容器或者任务开始处理abort状态。
    // 因为错误隔离容器的任务之间不受影响
    // 为什么不直接在下一级的任务上面设置错误隔离标志呢？
    // 因为错误隔离一般来说同一个容器里面执行同一套标准
    // 不能说一个容器里面有些隔离，有些不隔离。逻辑上过于复杂。
    for (let i = 1; i < taskChain.length; i++) {
      if (taskChain[i]?.config?.isolateError) {
        setAbortRootTask = taskChain[i - 1]
        setAbortRootParentTask = taskChain[i]
        break
      }
    }
    // 如果没有找到，就从根任务开始
    if (!setAbortRootTask) {
      setAbortRootTask = taskChain[taskChain.length - 1]
    }
    this.walkForAbort(setAbortRootTask, abortedTask)
    if (!setAbortRootParentTask) {
      // 如果不是隔离的，就从出现异常的地方之上的容器任务一路设置 STOPPED 到根节点
      for (let i = 1; i < taskChain.length; i++) {
        taskChain[i].state = FlowConst.state.STOPPED
      }
      return rootTask
    } else {
      // 当处于隔离任务下的时候
      // 设置被abort分支的父容器状态，看下面的子任务是否都处于结束状态
      const isEndedState = {
        [FlowConst.state.FINISHED]: true,
        [FlowConst.state.ABORTED]: true,
        [FlowConst.state.STOPPED]: true
      }
      const endedSubTaskCount = setAbortRootParentTask.children.filter(
        t => isEndedState[t.state]
      ).length
      if (endedSubTaskCount === setAbortRootParentTask.children.length) {
        this.setFinished(setAbortRootParentTask, rootTask)
      }
    }
    return rootTask
  }

  walkForAbort(task, abortedTask) {
    if (task.service === FlowConst.flow.PARALLEL || task.service === FlowConst.flow.SERIAL) {
      if (task.state === FlowConst.state.RUNNING) {
        task.state = FlowConst.state.STOPPED
      }
      for (const subTask of task.children) {
        this.walkForAbort(subTask, abortedTask)
      }
    } else {
      if (task.taskId === abortedTask.taskId) {
        // 如果就是出现 ABORT 的本身，就直接设置为 ABORTED。
        // 初始状态 RUNNING 和 STOPPING 都存在
        if (task.state === FlowConst.state.RUNNING || task.state === FlowConst.state.STOPPING) {
          task.state = FlowConst.state.ABORTED
        }
      } else {
        // 把只要是 RUNNING 的都设置为 STOPPING
        if (task.state === FlowConst.state.RUNNING) {
          task.state = FlowConst.state.STOPPING
        }
      }
    }
  }

  async rollback(mainJobId, isRedo = false, allowAbort = false) {
    const rootTask = await this.flowInstanceService.getRootTask(mainJobId)
    await this.serviceRollback(rootTask, mainJobId, isRedo)
  }

  async setRolledbackAndSave(task, mainJobId) {
    let rt
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      task = this.flowInstanceService.getTaskByIdFromRoot(task.taskId, rootTask)
      task.state = FlowConst.state.ROLLEDBACK
      rt = {
        task,
        rootTask
      }
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    return rt
  }

  async setRollingbackAndSave(task, mainJobId) {
    let rt
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      task = this.flowInstanceService.getTaskByIdFromRoot(task.taskId, rootTask)
      const newTask = this.setRollingback(task)
      rt = {
        task: newTask,
        rootTask
      }
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    return rt
  }

  setRollingback(rootTask) {
    this.walkSetRollingBack(rootTask, [])
    return rootTask
  }

  walkSetRollingBack(task, cancelingTasks) {
    // 先尝试设置自己的状态，两个状态变化都尝试
    // 所有处于 FINISHED, RUNNING, ABORTED, STOPPING, STOPPED 状态的普通任务都要变成 ROLLINGBACK
    // 包括了容器任务和普通任务
    const canSetRollingBack = {
      [FlowConst.state.FINISHED]: true,
      [FlowConst.state.RUNNING]: true,
      [FlowConst.state.ABORTED]: true,
      [FlowConst.state.STOPPING]: true,
      [FlowConst.state.STOPPED]: true
    }
    if (canSetRollingBack[task.state]) {
      task.state = FlowConst.state.ROLLINGBACK
    } else if (task.state === FlowConst.state.READY) {
      // 所有处于 READY 状态的普通任务都要变成 CANCELED
      // 包括了容器任务和普通任务
      task.state = FlowConst.state.CANCELED
    }

    if (task.service === FlowConst.flow.SERIAL) {
      for (let i = task.children.length - 1; i >= 0; i--) {
        const subTask = task.children[i]
        this.walkSetRollingBack(subTask, cancelingTasks)
        if (canSetRollingBack[subTask.state]) {
          // 到这个点就不要再继续了，就在这里开始执行
          break
        }
      }
    } else if (task.service === FlowConst.flow.PARALLEL) {
      for (const subTask of task.children) {
        this.walkSetRollingBack(subTask, cancelingTasks)
      }
    }
  }

  async parallelFlowInvoke(parallelTask, isRedo): Promise<any> {
    // mainJobId 一开始就要拿出来，后面从数据库里面取新数据覆盖的时候会被冲掉。
    const mainJobId = parallelTask.mainJobId
    const canRun = {
      [FlowConst.state.READY]: true,
      [FlowConst.state.RUNNING]: true,
      [FlowConst.state.STOPPED]: true
    }
    let runningTasks
    // 这里不用 setRunningAndSave() 的原因是要拿到 runningTask
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      parallelTask = this.flowInstanceService.getTaskByIdFromRoot(parallelTask.taskId, rootTask)
      const subTasks = parallelTask.children
      runningTasks = subTasks.filter(t => canRun[t.state])
      this.setRunning(parallelTask)
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
    // 把所有的task真正跑起来
    const promiseList = runningTasks.map(async runningTask => {
      const invoke = async () => {
        try {
          runningTask.mainJobId = mainJobId
          const rt = await this.serviceInvoke(runningTask, mainJobId, isRedo)
          // 更新成功状态
          await this.setFinishedAndSave(runningTask, mainJobId)
          if (parallelTask?.config?.onSubTaskFinished) {
            const service: any = await this.getService(parallelTask.config.onSubTaskFinished)
            const rootTask = await this.flowInstanceService.getRootTask(runningTask.mainJobId)
            const newRunningTask = this.flowInstanceService.getTaskByIdFromRoot(
              runningTask.taskId,
              rootTask
            )
            newRunningTask.mainJobId = mainJobId
            service.action(newRunningTask)
          }
          return rt
        } catch (e) {
          let isNearestAbort
          let abortTask
          if (e.taskInfo) {
            abortTask = e.taskInfo
            isNearestAbort = false
          } else {
            abortTask = runningTask
            isNearestAbort = true
          }
          let error
          // 防止重复包装
          if (e.taskInfo) {
            error = e
          } else {
            error = {
              taskInfo: abortTask,
              error: e
            }
          }
          if (isNearestAbort) {
            // console.log(error.taskInfo.service);
            // console.log(error.error);
            // 只有第一次触发异常的地方可以设置状态。
            await this.setAbortedAndSave(abortTask, mainJobId)
          }
          if (parallelTask?.config?.onSubTaskFinished) {
            const service: any = await this.getService(parallelTask.config.onSubTaskFinished)
            const rootTask = await this.flowInstanceService.getRootTask(mainJobId)
            runningTasks.forEach(runningTask => {
              const newRunningTask = this.flowInstanceService.getTaskByIdFromRoot(
                runningTask.taskId,
                rootTask
              )
              newRunningTask.mainJobId = mainJobId
              service.action(newRunningTask)
            })
          }
          if (!parallelTask?.config?.isolateError) {
            throw error
          } else {
            // this.ctx.logger.error(JSON.stringify(error, null, 2));
            console.error(JSON.stringify(error, null, 2))
          }
        }
      }
      // this.services.push(service);
      let p
      if (parallelTask?.config?.isolateError) {
        // https://stackoverflow.com/questions/44158629/get-bluebird-promise-from-async-await-functions
        p = Bluebird.method(invoke)()
      } else {
        p = invoke()
      }
      if (parallelTask?.config?.isolateError) {
        return p.reflect()
      }
      return p
    })
    const rts = await Promise.all(promiseList)
    if (parallelTask?.config?.onAllFinished) {
      const service: any = await this.getService(parallelTask.config.onAllFinished)
      const rootTask = await this.flowInstanceService.getRootTask(mainJobId)
      const newParallelTask = this.flowInstanceService.getTaskByIdFromRoot(
        parallelTask.taskId,
        rootTask
      )
      newParallelTask.mainJobId = mainJobId
      service.action(newParallelTask)
    }
    return rts
  }

  async parallelFlowRollback(parallelTask, isRedo) {
    // task 可能会被覆盖先把 mainJobId 拿出来。因为这个是不存数据库的。
    const mainJobId = parallelTask.mainJobId
    const rt = await this.setRollingbackAndSave(parallelTask, mainJobId)
    parallelTask = rt.task

    const rollingbackTasks = parallelTask.children.filter(
      t => t.state === FlowConst.state.ROLLINGBACK
    )
    if (rollingbackTasks.length > 0) {
      const promiseList = []
      for (const subTask of rollingbackTasks) {
        const service: any = await this.getService(subTask.service)
        subTask.mainJobId = mainJobId
        promiseList.push(await service.frameworkRollback(subTask, isRedo))
      }
      await Promise.all(promiseList)
    }

    await this.setRolledbackAndSave(parallelTask, mainJobId)
  }

  async getNextTask(currTask, serialTask) {
    const currTaskIndex = _.findIndex(serialTask.children, (t: any) => t.taskId === currTask.taskId)
    let nextTask = null
    await this.flowInstanceService.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      // 获取最新的 currTask 状态，因为是异步执行，所以状态有可能已经改变了。
      serialTask = this.flowInstanceService.getTaskByIdFromRoot(serialTask.taskId, rootTask)
      currTask = serialTask.children[currTaskIndex]
      // 如果状态被改变为STOPPING了，就返回了。因为可能被其他ABORT打断了。
      if (currTask.state === FlowConst.state.STOPPING) {
        return
      }
      await this.setFinished(currTask, rootTask)
      // 如果不是最后一个，获取后面一个
      if (currTaskIndex !== serialTask.children.length - 1) {
        nextTask = serialTask.children[currTaskIndex + 1]
        nextTask = this.setRunning(nextTask)
      }
      await this.flowInstanceService.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, serialTask.mainJobId)
    return nextTask
  }

  async getFirstTask(serialTask) {
    const canRun = {
      [FlowConst.state.READY]: true,
      [FlowConst.state.ABORTED]: true,
      [FlowConst.state.STOPPING]: true,
      [FlowConst.state.STOPPED]: true,
      [FlowConst.state.RUNNING]: true
    }
    // 因为这次执行可能是重做，有些步骤已经做了，需要每一步检查状态。
    let firstTask = null
    for (const subTask of serialTask.children) {
      if (subTask.state === FlowConst.state.FINISHED) {
        continue
      } else if (canRun[subTask.state]) {
        firstTask = subTask
        break
      }
    }
    if (!firstTask) {
      return null
    }
    const rt = await this.setRunningAndSave(firstTask, serialTask.mainJobId)
    return rt.task
  }

  async serialFlowInvoke(serialTask, isRedo): Promise<any> {
    // mainJobId 一开始就要拿出来，后面从数据库里面取新数据覆盖的时候会被冲掉。
    const mainJobId = serialTask.mainJobId
    let currTask = await this.getFirstTask(serialTask)
    // let tailTaskInfo = null;
    // 可能有中途 abort 更改状态。所以必须要检测一次。
    while (currTask && currTask.state === FlowConst.state.RUNNING) {
      try {
        // 注意一定要有这一句，不然在后面的子任务中不知道 mainJobId 是哪个
        currTask.mainJobId = mainJobId
        await this.serviceInvoke(currTask, mainJobId, isRedo)
      } catch (e) {
        let isNearestAbort
        let abortTask
        if (e.taskInfo) {
          abortTask = e.taskInfo
          isNearestAbort = false
        } else {
          abortTask = currTask
          isNearestAbort = true
        }
        let error
        // 防止重复包装
        if (e.taskInfo) {
          error = e
        } else {
          error = {
            taskInfo: abortTask,
            error: e
          }
        }
        if (isNearestAbort) {
          // 只有第一次触发异常的地方可以设置状态。
          await this.setAbortedAndSave(abortTask, mainJobId)
        }
        if (!serialTask?.config?.isolateError) {
          throw error
        } else {
          // this.ctx.logger.error(JSON.stringify(error, null, 2));
          console.error(JSON.stringify(error, null, 2))
        }
      }
      if (
        currTask.service !== FlowConst.flow.SERIAL &&
        currTask.service !== FlowConst.flow.PARALLEL
      ) {
        // 这里不能设置当前 currTaskInfo 的状态，只能在 getNextTask() 设置，因为统一处理。不然容易被打断状态不一致
        // await this.flowManagerService.setFinished(currTaskInfo);
      }
      currTask = await this.getNextTask(currTask, serialTask)
    }
    if (serialTask?.config?.onAllFinished) {
      const service: any = await this.getService(serialTask.config.onAllFinished)
      const rootTask = await this.flowInstanceService.getRootTask(mainJobId)
      const newSerialTask = this.flowInstanceService.getTaskByIdFromRoot(
        serialTask.taskId,
        rootTask
      )
      newSerialTask.mainJobId = mainJobId
      service.action(newSerialTask)
    }
  }

  async serialFlowRollback(serialTask, isRedo) {
    // task 可能会被覆盖先把 mainJobId 拿出来。因为这个是不存数据库的。
    const mainJobId = serialTask.mainJobId
    await this.setRollingbackAndSave(serialTask, mainJobId)

    for (let i = serialTask.children.length - 1; i >= 0; i--) {
      const subTask = serialTask.children[i]
      if (subTask.state === FlowConst.state.CANCELED) {
        continue
      } else {
        const service: any = await this.getService(subTask.service)
        subTask.mainJobId = mainJobId
        await service.frameworkRollback(subTask, isRedo)
      }
    }

    await this.setRolledbackAndSave(serialTask, mainJobId)
  }

  private async serviceInvoke(task: any, mainJobId: string, isRedo: boolean) {
    console.log(task.service)
    // 注意一定要有这一句，不然在后面的子任务中不知道 mainJobId 是哪个
    task.mainJobId = mainJobId
    if (task.service === FlowConst.flow.SERIAL) {
      return await this.serialFlowInvoke(task, isRedo)
    } else if (task.service === FlowConst.flow.PARALLEL) {
      return await this.parallelFlowInvoke(task, isRedo)
    } else {
      const service = await this.getService(task.service)
      return await service.invoke(task, isRedo)
    }
  }

  private async serviceRollback(task: any, mainJobId: any, isRedo: boolean) {
    // 注意一定要有这一句，不然在后面的子任务中不知道 mainJobId 是哪个
    task.mainJobId = mainJobId
    if (task.service === FlowConst.flow.SERIAL) {
      return await this.serialFlowRollback(task, isRedo)
    } else if (task.service === FlowConst.flow.PARALLEL) {
      return await this.parallelFlowRollback(task, isRedo)
    } else {
      const service: any = await this.getService(task.service)
      await service.frameworkRollback(task, isRedo)
    }
  }
}
