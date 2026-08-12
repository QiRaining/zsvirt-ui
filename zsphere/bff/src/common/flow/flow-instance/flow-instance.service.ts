import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'
import { Sequelize } from 'sequelize'

import { ZsFlow } from '../../../model/zs-flow.model'

@Injectable()
export class FlowInstanceService {
  constructor(
    @InjectModel(ZsFlow)
    private zsFlow: typeof ZsFlow,
    @InjectConnection()
    private sequelize: Sequelize
  ) {}

  async create(flow, mainJobId, options = undefined) {
    return this.zsFlow.create(
      {
        mainJobId,
        flow,
        state: flow.state ? flow.state : 'READY',
        createDate: new Date(),
        lastOpDate: new Date()
      },
      options
    )
  }

  async update(param, id, mutex) {
    if (id === undefined) {
      throw Error('FlowInstanceService id is missing')
    }
    if (mutex === undefined) {
      throw Error('FlowInstanceService mutex is missing')
    }
    param.lastOpDate = new Date().getTime()
    return this.zsFlow.update(param, {
      where: { id },
      transaction: mutex
    })
  }

  async findByMainJobId(mainJobId) {
    const rt = await this.zsFlow.findOne({ where: { mainJobId } })
    if (rt) {
      return rt.toJSON()
    }
    return null
  }

  async getRootTask(mainJobId) {
    return ((await this.findByMainJobId(mainJobId)) as any).flow
  }

  async initMutex() {
    return this.sequelize.transaction()
  }

  async lockByMainJobId(mainJobId, transaction) {
    const flowForLocking = await this.zsFlow.findOne({
      where: { mainJobId },
      transaction
    })
    const instance = await this.zsFlow.findOne({
      where: { id: flowForLocking.id },
      transaction,
      lock: transaction.LOCK.UPDATE
    })
    return instance.toJSON()
  }

  async unlock(transaction) {
    await transaction.commit()
  }

  async safeUpdate(updator, mainJobId) {
    const mutex = await this.initMutex()
    const flowInstance = await this.lockByMainJobId(mainJobId, mutex)
    await updator(flowInstance, mutex)
    await this.unlock(mutex)
  }

  getTaskChainToRoot(taskId, rootTask) {
    const walk = t => {
      if (t.taskId === taskId) {
        return [t]
      } else if (!t.children) {
        return null
      } else {
        for (const subTask of t.children) {
          const rt = walk(subTask)
          if (rt != null) {
            rt.push(t)
            return rt
          }
        }
      }
      return null
    }
    return walk(rootTask)
  }

  getTaskByIdFromRoot(taskId, rootTask) {
    const walk = t => {
      if (t.taskId === taskId) {
        return t
      }
      if (t.children) {
        for (const subTask of t.children) {
          const rt = walk(subTask)
          if (rt) {
            return rt
          }
        }
      } else {
        return null
      }
    }
    return walk(rootTask)
  }

  async setResult(result, taskId, mainJobId) {
    await this.safeUpdate(async (flowInstance, mutex) => {
      const rootTask = flowInstance.flow
      const task = this.getTaskByIdFromRoot(taskId, rootTask)
      task.result = result
      await this.update(
        {
          flow: rootTask,
          state: rootTask.state
        },
        flowInstance.id,
        mutex
      )
    }, mainJobId)
  }

  getParentFromRoot(taskId, rootTask) {
    const walk = t => {
      if (!t.children) {
        return null
      }
      if (_.find(t.children, t => t.taskId === taskId)) {
        return t
      }
      for (const subTask of t.children) {
        const rt = walk(subTask)
        if (rt) {
          return rt
        }
      }
      return null
    }
    return walk(rootTask)
  }

  async getPrevFromRoot(taskId, rootTask) {
    const parentTask = this.getParentFromRoot(taskId, rootTask)
    for (let i = 1; i < parentTask.children.length; i++) {
      if (parentTask.children[i].taskId === taskId) {
        return parentTask.children[i - 1]
      }
    }
    return null
  }

  async getParentTask(task) {
    const rootTask = await this.getRootTask(task.mainJobId)
    return this.getParentFromRoot(task.taskId, rootTask)
  }

  async getPrevTask(task) {
    const rootTask = await this.getRootTask(task.mainJobId)
    return this.getPrevFromRoot(task.taskId, rootTask)
  }
}
