import { Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'
import { Transaction } from 'sequelize/types'

import { GetResourceNamesAction } from '@/api/zstack/GetResourceNamesAction'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsActionTask } from '@/model/zs-action-task.model'
import { ZsAction } from '@/model/zs-action.model'
import { ZsSession } from '@/model/zs-session.model'

import { CacheService } from '../cache/cache.service'

export class RecordActionService {
  @Inject(CONTEXT) private readonly context
  @InjectModel(ZsSession) private zsSession: typeof ZsSession
  @InjectModel(ZsAction) private zsAction: typeof ZsAction
  @InjectModel(ZsActionTask) private zsActionTask: typeof ZsActionTask
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @Inject() getResourceNameAction: GetResourceNamesAction
  @Logger(RecordActionService.name) private logger: ZSLoggerService
  @Inject() cacheService: CacheService

  protected getZsSession() {
    return this.zsSession
  }

  protected getSessionId(req: any = this.context.req): string {
    return req.headers['x-session-id']
  }

  protected getLoginIp(req: any = this.context.req): string {
    const ipList = [
      _.get(_.split(req.headers['x-forwarded-for'], ','), '0', undefined),
      req.headers['x-real-ip'],
      req.headers['proxy-client-ip'],
      req.headers['wl-proxy-client-ip'],
      req.headers['http_client_ip'],
      req.headers['http_x_forwarded_for'],
      req.ip
    ]

    return _.find(ipList, ip => !_.isEmpty(ip) && !_.isEqual('unknown', _.toLower(ip)))
  }

  async recordActionStart(
    param: any,
    actionId,
    actionName,
    options: { req?: any; resourceUuids?: string } = {}
  ) {
    if (!actionId) {
      return null
    }
    const sessionId = this.getSessionId(options.req)
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })

    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }
    let inventories = null
    try {
      const {
        inventories: _inventories
      }: {
        inventories?: { resourceName?: string }[]
      } = await this.getResourceNameAction.call({
        uuids: [session.userId]
      })
      inventories = _inventories
    } catch (e) {
      this.logger.error(e)
    }
    const loginIp = this.getLoginIp(options.req)
    this.cacheService.set(
      actionId,
      {
        actionName,
        sessionId,
        userUuid: session.userId,
        accountUuid: session.accountId,
        loginIp,
        userName: inventories?.[0]?.resourceName
      },
      { ttl: 30 * 60 }
    )
    this.logger.debugJson({
      type: 'operationLog',
      status: 'Running',
      actionId,
      actionName,
      userUuid: session.userId,
      accountUuid: session.accountId,
      loginIp,
      userName: inventories?.[0]?.resourceName,
      lastOpDate: new Date()
    })
    const createData: any = {
      actionId: actionId,
      name: actionName,
      status: 'Running',
      userId: session.userId,
      progress: 0,
      createDate: new Date(),
      loginIp,
      resourceUuids: options?.resourceUuids,
      userName: inventories?.[0]?.resourceName,
      accountId: session.accountId
    }

    // 明确指定要插入的字段，避免 Sequelize 根据模型定义自动包含不存在的字段
    const fields = [
      'actionId',
      'name',
      'status',
      'userId',
      'progress',
      'createDate',
      'loginIp',
      'resourceUuids',
      'userName',
      'accountId'
    ]

    return await this.zsAction.create(createData, {
      fields: fields as any
    })
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
    await this.zsAction.update(
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
    await this.zsAction.update(
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
    await this.zsAction.update(
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
