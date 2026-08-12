import { Inject } from '@nestjs/common'
import { Resolver, Query, Args, Parent, ResolveField } from '@nestjs/graphql'
import * as _ from 'lodash'

import { GetTaskProgressAction } from '@/api/zstack/GetTaskProgressAction'
import { QueryAction } from '@/common/model/action-query.model'
import { TaskProgress } from '@/common/task-progress/task-progress.model'

import {
  OperationApi,
  OperationLog,
  QueryOperationLogResp,
  QueryOperationLongjobResp,
  OperationLongjob,
  OperationLongjobStatus
} from './operation-log.model'
import { OperationLogService } from './operation-log.service'

@Resolver(() => OperationLog)
export class OperationLogResolver {
  @Inject() operationLogService: OperationLogService

  @Query(() => QueryOperationLogResp)
  async operationLogList(@Args() params: QueryAction): Promise<QueryOperationLogResp> {
    return this.operationLogService.queryAction(params)
  }

  @ResolveField(() => String)
  async userName(@Parent() operationLog: OperationLog) {
    return this.operationLogService.queryUserName(operationLog.userId)
  }

  @ResolveField(() => String)
  async isValid(@Parent() operationLog: OperationLog) {
    return this.operationLogService.checkDataIntegrity(operationLog)
  }

  @ResolveField(() => String)
  async resourceNames(@Parent() operationLog: OperationLog) {
    if (!operationLog.resourceUuids?.length) {
      return null
    }
    return this.operationLogService.queryResourceNameForAction(operationLog.resourceUuids)
  }

  @Query(() => QueryOperationLongjobResp)
  async operationLongjobList(@Args() params: QueryAction): Promise<QueryOperationLongjobResp> {
    return this.operationLogService.queryLongjob(params)
  }
}

@Resolver(() => OperationLongjob)
export class OperationLogLongJobResolver {
  @Inject() operationLogService: OperationLogService
  @Inject() getTaskProgressAction: GetTaskProgressAction

  @Query(() => QueryOperationLongjobResp)
  async operationLongjobList(@Args() params: QueryAction): Promise<QueryOperationLongjobResp> {
    return this.operationLogService.queryLongjob(params)
  }

  @ResolveField(() => TaskProgress, { nullable: true })
  async taskProgressDetails(@Parent() operationLongjob: OperationLongjob) {
    if (operationLongjob?.state === OperationLongjobStatus.RUNNING) {
      const taskProgress = await this.getTaskProgressAction.call({
        apiId: operationLongjob?.clientJobUuid,
        all: true
      })

      const lastTaskInfo = _.maxBy(
        _.filter(_.compact(taskProgress.inventories), it => it.type === 'Progress'),
        o => {
          return o?.time
        }
      )

      return lastTaskInfo
    }

    return null
  }
}

@Resolver(() => OperationApi)
export class OperationApiResolver {
  @Inject() operationLogService: OperationLogService

  @ResolveField(() => String)
  async req(@Parent() api: OperationApi) {
    return JSON.stringify(api.req)
  }

  @ResolveField(() => String)
  async resp(@Parent() api: OperationApi) {
    return JSON.stringify(api.resp)
  }

  @ResolveField(() => String)
  async resourceName(@Parent() api: OperationApi) {
    return this.operationLogService.queryResourceName(api.apiId)
  }
}
