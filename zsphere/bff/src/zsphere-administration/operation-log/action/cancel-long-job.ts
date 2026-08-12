import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import * as _ from 'lodash'

import { ActionInfo } from '@/api/zstack/base/types'
import { CancelLongJobAction } from '@/api/zstack/CancelLongJobAction'
import { QueryLongJobAction } from '@/api/zstack/QueryLongJobAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ActionTaskState } from '@/common/model/action.model'
import { ApplicationContext } from '@/cron/application.context.service'
import { ZsActionApi } from '@/model/zs-action-api.model'
import { ZsLongJob } from '@/model/zs-long-job.model'

@InputType()
export class CancelLongjobPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean, {
    defaultValue: false,
    nullable: true,
    description: '值为true时只调用后端API'
  })
  apiOnly?: boolean
}

@InputType()
export class CancelLongjobInput {
  @Field(() => [CancelLongjobPayload])
  payload: [CancelLongjobPayload]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CancelLongjobHelperService extends ActionService {
  @Inject() cancelAction: CancelLongJobAction
  @Inject() queryAction: QueryLongJobAction
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsLongJob) private zsLongJob: typeof ZsLongJob

  async call({ longjobUuid }: { longjobUuid: string }, _info: ActionInfo = {}) {
    await this.cancelAction.call(
      {
        uuid: longjobUuid
      },
      _info
    )

    const resp = await this.queryAction.call({
      conditions: [{ key: 'uuid', value: longjobUuid }]
    })
    const longJobInventory = resp?.inventories?.[0]

    const longJob = await this.zsLongJob.findOne({
      where: { longJobUuid: longjobUuid }
    })

    if (!longJob) {
      return {
        id: longjobUuid
      }
    }
    await this.zsActionApi.update(
      { resp: longJobInventory },
      { where: { apiId: longJobInventory.apiId } }
    )
    await this.zsLongJob.update({ progress: 100, state: 'CANCELED' }, { where: { id: longJob.id } })
    await this.recordActionService.recordActionCanceled(longJob.clientJobUuid)
    await this.recordActionService.recordTaskCanceled(longJob.clientJobUuid)
    await this.recordActionService.recordApiCanceled(longJob.clientJobUuid)
    const _payload = {
      // id - 参照 action.model 文件的ActionTaskResult类型定义
      id: longJob.clientJobUuid,
      actionId: longJob.clientJobUuid,
      state: ActionTaskState.fail,
      type: longJob.resourceType,
      error: _.isString(longJobInventory.jobResult)
        ? longJobInventory.jobResult
        : JSON.stringify(longJobInventory.jobResult)
    }
    const context = ApplicationContext.getInstance()
    const pro = context.get(longJob.clientJobUuid)
    if (pro !== undefined) {
      pro?.resolve(_payload)
    } else {
      this.pubSubService.response({
        ..._payload,
        sessionId: this.getSessionId()
      })
    }
  }
}

export class CancelLongjobService extends ActionService {
  @Inject() cancelAction: CancelLongJobAction
  @Inject() queryAction: QueryLongJobAction
  @InjectModel(ZsActionApi) private zsActionApi: typeof ZsActionApi
  @InjectModel(ZsLongJob) private zsLongJob: typeof ZsLongJob

  @Mutation(() => ActionResult)
  cancelLongjob(@Args('input') input: CancelLongjobInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'OperationLongjob',
      async (payload: CancelLongjobPayload, taskId: string) => {
        await this.cancelAction.call(
          {
            uuid: payload.uuid
          },
          {
            actionId,
            taskId
          }
        )

        if (!payload?.apiOnly) {
          const resp = await this.queryAction.call({
            conditions: [{ key: 'uuid', value: payload.uuid }]
          })
          const longJobInventory = resp?.inventories?.[0]

          const longJob = await this.zsLongJob.findOne({
            where: { longJobUuid: payload.uuid }
          })

          if (!longJob) {
            return {
              id: payload.uuid
            }
          }
          await this.zsActionApi.update(
            { resp: longJobInventory },
            { where: { apiId: longJobInventory.apiId } }
          )
          await this.zsLongJob.update(
            { progress: 100, state: 'CANCELED' },
            { where: { id: longJob.id } }
          )
          await this.recordActionService.recordActionCanceled(longJob.clientJobUuid)
          await this.recordActionService.recordTaskCanceled(longJob.clientJobUuid)
          await this.recordActionService.recordApiCanceled(longJob.clientJobUuid)
          const _payload = {
            // id - 参照 action.model 文件的ActionTaskResult类型定义
            id: longJob.clientJobUuid,
            actionId: longJob.clientJobUuid,
            state: ActionTaskState.fail,
            type: longJob.resourceType,
            error: _.isString(longJobInventory.jobResult)
              ? longJobInventory.jobResult
              : JSON.stringify(longJobInventory.jobResult)
          }
          const context = ApplicationContext.getInstance()
          const pro = context.get(longJob.clientJobUuid)
          if (pro !== undefined) {
            pro?.resolve(_payload)
          } else {
            this.pubSubService.response({
              ..._payload,
              sessionId: this.getSessionId()
            })
          }
        }

        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
