import { Injectable } from '@nestjs/common'
import { ContextIdFactory, ModuleRef } from '@nestjs/core'
import { InjectModel } from '@nestjs/sequelize'
import { Transaction } from 'sequelize/types'

import { CacheService } from '@/common/cache'
import { Logger } from '@/common/logger/logger.decorator'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsSession } from '@/model/zs-session.model'

import { ZSLoggerService } from '../logger/logger.service'

@Injectable()
export class RecordActionServiceBase {
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZsAction) private zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @Logger(RecordActionServiceBase.name) private logger: ZSLoggerService
  // @Inject() cacheService: CacheService

  private cacheService: CacheService
  async onModuleInit() {
    const contextId = ContextIdFactory.create()
    this.cacheService = await this.moduleRef.resolve(CacheService, contextId, {
      strict: false
    })
  }

  constructor(private moduleRef: ModuleRef) {}

  protected getZsSession() {
    return this.zsSession
  }

  async recordActionProgress(actionId: string, progress: number, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    this.zsAction.update(
      {
        progress,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordActionSuccess(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Success',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Success',
        progress: 100,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }
  async recordActionSuspended(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Suspended',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Suspended',
        progress: 100,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }
  async recordActionResume(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Running',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Running',
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordActionFailed(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Failed',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Failed',
        progress: 100,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordActionException(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Exception',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Exception',
        progress: 100,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordActionCanceled(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Canceled',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Canceled',
        progress: 100,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordActionCanceling(actionId: string, transaction?: Transaction) {
    if (!actionId) {
      return null
    }
    const cachedOperationInfo: any = await this.cacheService.get(actionId)
    delete cachedOperationInfo?.sessionId
    this.logger.debugJson({
      type: 'operationLog',
      ...cachedOperationInfo,
      status: 'Canceling',
      actionId,
      lastOpDate: new Date()
    })
    this.zsAction.update(
      {
        status: 'Canceling',
        progress: 0,
        lastOpDate: new Date()
      },
      {
        where: { actionId },
        transaction
      }
    )
  }

  async recordTaskStart(taskId: string, actionId: string) {
    if (!taskId || !actionId) {
      return null
    }
    return await this.zsActionTask.create({
      taskId,
      actionId,
      status: 'Running',
      createDate: new Date()
    })
  }

  async recordTaskSuspended(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Suspended',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  async recordTaskResume(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Running',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  async recordTaskSuccess(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Success',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }

  async recordTaskFailed(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Failed',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }

  async recordTaskException(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Exception',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }

  async recordTaskCanceling(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Canceling',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }

  async recordTaskCanceled(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionTask.update(
      {
        status: 'Canceled',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  // longjob专用
  async recordApiSuccess(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Success',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  async recordApiSuspended(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Suspended',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  async recordApiResume(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Running',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  async recordApiFailed(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Failed',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  // longjob专用
  async recordApiCanceled(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Canceled',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }
  // longjob专用
  async recordApiCanceling(taskId: string, transaction?: Transaction) {
    if (!taskId) {
      return null
    }
    this.zsActionApi.update(
      {
        status: 'Canceling',
        lastOpDate: new Date()
      },
      {
        where: { taskId },
        transaction
      }
    )
  }

  async encryptText(text: string) {
    return text
  }
}
