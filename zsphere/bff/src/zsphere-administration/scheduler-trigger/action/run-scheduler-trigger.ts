import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import {
  RunSchedulerTriggerAction,
  RunSchedulerTriggerResult
} from '@/api/zstack/RunSchedulerTriggerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZQLAction } from '@/common/zql/index'
import { genUuid } from '@/utils'

@InputType()
class RunSchedulerTriggerPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true })
  jobUuids?: string[]
}

@InputType()
class RunSchedulerTriggerInput {
  @Field(() => [RunSchedulerTriggerPayload])
  payload: RunSchedulerTriggerPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RunSchedulerTriggerService extends ActionService {
  @Inject() runSchedulerTriggerAction: RunSchedulerTriggerAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  runSchedulerTrigger(@Args('input') input: RunSchedulerTriggerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerTrigger',
      async (payload: RunSchedulerTriggerPayload, taskId: string) => {
        const fireInstanceId = genUuid()
        const result: RunSchedulerTriggerResult = await this.runSchedulerTriggerAction.call(
          { ...payload },
          { actionId, taskId, apiId: fireInstanceId }
        )
        await this.pollSchedulerJobResult(fireInstanceId)
        return {
          id: payload.uuid,
          ...result
        }
      }
    )
    return { actionId }
  }

  private async pollSchedulerJobResult(fireInstanceId: string) {
    const zql = ZQL.stringify({
      action: ZQLAction.COUNT,
      tableName: 'SchedulerJobHistory',
      condition: {
        fireInstanceId,
        resultDump: 'Running'
      }
    })
    const timeoutMs = 6 * 60 * 60 * 1000
    const pollIntervalMs = 5 * 1000
    const maxPolls = Math.ceil(timeoutMs / pollIntervalMs)

    let pollCount = 0
    for (; pollCount < maxPolls; pollCount += 1) {
      await new Promise<void>(resolve => setTimeout(resolve, pollIntervalMs))
      const { results = [] } = await this.zqlService.call(zql)
      const total = results?.[0]?.total ?? 0
      if (total === 0) {
        break
      }
    }

    if (pollCount === maxPolls) {
      throw new Error('Polling for scheduler job result timed out')
    }
  }
}
