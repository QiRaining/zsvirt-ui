import { exec } from 'child_process'

import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult, ActionTaskState } from '@/common/model/action.model'
import { AuditResolver } from '@/maintenance/audit/audit.resolver'
import { ZsLogCollect } from '@/model/zs-log-collect.model'
import { genUuid } from '@/utils'
import { OperationLogResolver } from '@/zsphere-administration/operation-log/operation-log.resolver'

@InputType()
class CancelLogCollectPayload {
  @Field(() => String)
  actionUuid: string

  @Field(() => String)
  taskUuid: string

  @Field(() => String)
  uuid: string
}

@InputType()
class CancelLogCollectInput {
  @Field(() => CancelLogCollectPayload)
  payload: CancelLogCollectPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CancelLogCollectService extends ActionService {
  @InjectModel(ZsLogCollect) private zsLogCollect: typeof ZsLogCollect
  @Inject()
  zstackApiBase: ZStackApiBase
  @Inject() configService: ConfigService
  @Inject() operationLogResolver: OperationLogResolver
  @Inject() auditResolver: AuditResolver
  @Mutation(() => ActionResult)
  async cancelLogCollect(@Args('input') input: CancelLogCollectInput) {
    const sessionId = this.getSessionId()
    const session = await this.getZsSession().findOne({
      where: {
        sessionId
      }
    })
    if (!session) {
      throw Error(`Invalid sessionId [${sessionId}]`)
    }

    if (['Admin', 'PlatformAdmin'].indexOf(session.identity) === -1) {
      throw Error(`current api is admin only`)
    }
    const actionId = input.action.actionId
    const actionFn = async (payload: CancelLogCollectPayload, taskId: string) => {
      const apiRecord = await this.zstackApiBase.recordStart(
        { uuid: genUuid() },
        { actionId, taskId, apiId: genUuid() },
        'CANCEL_LOG_COLLECT'
      )
      /**
       * 取消收集任务
       * 1.先查询到configured_collect_log进程pid进行kill
       * 2.修改数据库对应status
       */
      exec(
        `ps aux | grep 'zstack-ctl configured_collect_log' | grep -v grep | awk '{print $2}'`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return
          }
          const pids = stdout
            .split('\n')
            .filter(pid => pid !== '')
            .map(pid => parseInt(pid))
          pids.forEach(pid => {
            exec(`sudo kill -9 ${pid}`, (error, stdout, stderr) => {
              if (error) {
                console.error(`kill error: ${error}`)
                return
              }
              console.log(`kill process ${pid} success`)
            })
          })
        }
      )

      const { uuid, actionUuid, taskUuid } = payload
      await this.recordActionService.recordActionFailed(actionUuid)
      await this.recordActionService.recordTaskFailed(taskUuid)
      await this.recordActionService.recordApiFailed(taskUuid)

      const _payload = {
        sessionId: this.getSessionId(),
        actionId: actionUuid,
        state: ActionTaskState.fail
      }

      this.pubSubService.response(_payload)

      try {
        await this.zsLogCollect.update(
          {
            state: 'FAILED',
            lastOpDate: new Date()
          },
          {
            where: {
              uuid
            }
          }
        )
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
      } catch (err) {
        console.log(err)
        await this.zstackApiBase.recordFailed({ success: false, msg: err }, apiRecord)
        throw err
      }

      return {
        id: uuid
      }
    }

    this.actionHelper(input, 'LogCollect', actionFn)
    return { actionId }
  }
}
