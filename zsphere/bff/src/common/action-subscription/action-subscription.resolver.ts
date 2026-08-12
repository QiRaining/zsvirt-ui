import { Inject, Injectable } from '@nestjs/common'
import { Subscription, Args } from '@nestjs/graphql'

import { ApiInspector } from '@/api-inspector/api-inspector.model'
import { Logger } from '@/common/logger/logger.decorator'
import { ZSLoggerService } from '@/common/logger/logger.service'
import { ActionTaskResult } from '@/common/model/action.model'
import { AsyncQuery } from '@/common/model/async-query.model'
import { ZWatchEvent } from '@/common/model/zwatch-event.model'
import { ExportTask, ExportTaskExportPayload } from '@/data-export/data-export.model'

import { PubSubServiceBase } from '../pub-sub/pub-sub-base.service'
@Injectable()
export class ActionSubscriptionResolver {
  @Inject() private pubSubService: PubSubServiceBase
  @Logger(ActionSubscriptionResolver.name) logger: ZSLoggerService

  @Subscription(() => ActionTaskResult, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      if (payload.listenActionResp.sessionId === variables.sessionId) {
        this.logger.debug(
          `[Subscription push] [sessionId: ${payload.listenActionResp.sessionId}] [actionId: ${payload.listenActionResp.actionId}]`
        )
        return true
      }
      return false
    }
  })
  listenActionResp(@Args('sessionId') sessionId: string) {
    this.logger.debug(
      `[Action Subscription] [sessionId: ${sessionId}] [InstanceId: ${process.env.INSTANCE_ID}] [ProcessId: ${process.pid}]`
    )
    return this.pubSubService.get().asyncIterator(sessionId)
  }

  @Subscription(() => ZWatchEvent, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return payload.listenZWatch.sessionId === variables.sessionId
    }
  })
  listenZWatch(@Args('sessionId') sessionId: string) {
    console.log(
      'ZWatch Subscription, SessionId:',
      sessionId,
      'InstanceId:',
      process.env.INSTANCE_ID,
      'ProcessId',
      process.pid
    )
    return this.pubSubService.get().asyncIterator(`ZWatch-${sessionId}`)
  }

  @Subscription(() => ZWatchEvent, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return payload.listenZWatchConvergence.sessionId === variables.sessionId
    }
  })
  listenZWatchConvergence(@Args('sessionId') sessionId: string) {
    console.log(
      'ZWatch Subscription, SessionId:',
      sessionId,
      'InstanceId:',
      process.env.INSTANCE_ID,
      'ProcessId',
      process.pid
    )
    return this.pubSubService.get().asyncIterator(`ZWatchConvergence-${sessionId}`)
  }

  @Subscription(() => ZWatchEvent, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return payload.listenTicket.sessionId === variables.sessionId
    }
  })
  listenTicket(@Args('sessionId') sessionId: string) {
    console.log(
      'Ticket Subscription, SessionId:',
      sessionId,
      'InstanceId:',
      process.env.INSTANCE_ID,
      'ProcessId',
      process.pid
    )
    return this.pubSubService.get().asyncIterator(`Ticket-${sessionId}`)
  }

  @Subscription(() => ApiInspector, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return payload.listenApiInspector.sessionId === variables.sessionId
    }
  })
  listenApiInspector(@Args('sessionId') sessionId: string) {
    console.log(
      'ApiInspector Subscription, SessionId:',
      sessionId,
      'InstanceId:',
      process.env.INSTANCE_ID,
      'ProcessId',
      process.pid
    )
    return this.pubSubService.get().asyncIterator(`ApiInspector-${sessionId}`)
  }

  @Subscription(() => AsyncQuery, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return (
        payload.listenAsyncQuery.sessionId === variables.sessionId &&
        payload.listenAsyncQuery.queryName === variables.queryName &&
        payload.listenAsyncQuery.queryId === variables.queryId
      )
    }
  })
  // TODO: 这里用到了async query，要确认影响，因为PubSubServiceBase是不带CONTEXT的
  listenAsyncQuery(
    @Args('sessionId') sessionId: string,
    @Args('queryName') queryName: string,
    @Args('queryId') queryId: string
  ) {
    console.log(
      'AsyncQuery Subscription, SessionId:',
      sessionId,
      'queryName:',
      queryName,
      'queryId:',
      queryId,
      'InstanceId:',
      process.env.INSTANCE_ID,
      'ProcessId',
      process.pid
    )
    return this.pubSubService.get().asyncIterator(`AsyncQuery-${sessionId}-${queryName}-${queryId}`)
  }

  @Subscription(() => ExportTaskExportPayload, {
    filter(this: ActionSubscriptionResolver, payload, variables) {
      return payload.exportTaskUpdated.sessionId === variables.sessionId
    }
  })
  exportTaskUpdated(@Args('sessionId') sessionId: string) {
    return this.pubSubService.get().asyncIterator(`exportData-${sessionId}`)
  }
}
