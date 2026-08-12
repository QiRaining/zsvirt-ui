import { Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Context, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import dayjs from 'dayjs'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { AuditResolver } from '@/maintenance/audit/audit.resolver'
import { ZsLogCollect } from '@/model/zs-log-collect.model'
import { genUuid } from '@/utils'
import { OperationLogResolver } from '@/zsphere-administration/operation-log/operation-log.resolver'

import { CreateLogCollectService } from './create'
import { DeleteLogCollectService } from './delete'

@InputType()
class ReCreateLogCollectPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ReCreateLogCollectInput {
  @Field(() => ReCreateLogCollectPayload)
  payload: ReCreateLogCollectPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ReCreateLogCollectService extends ActionService {
  @InjectModel(ZsLogCollect) private zsLogCollect: typeof ZsLogCollect
  @Inject()
  zstackApiBase: ZStackApiBase
  @Inject() configService: ConfigService
  @Inject() operationLogResolver: OperationLogResolver
  @Inject() auditResolver: AuditResolver
  @Inject() createLogCollectService: CreateLogCollectService
  @Inject() deleteLogCollectService: DeleteLogCollectService

  @Mutation(() => ActionResult)
  reCreateLogCollect(
    @Args('input') input: ReCreateLogCollectInput,
    @Context() context: { req: Request }
  ) {
    const actionId = input.action.actionId

    const actionFn = async (payload: ReCreateLogCollectPayload, taskId: string) => {
      const { uuid } = payload
      const log = await this.zsLogCollect.findOne({ where: { uuid } })
      const { type, startTime, endTime } = log
      const apiId = genUuid()
      const apiRecord = await this.zstackApiBase.recordStart(
        { type, startTime, endTime },
        { actionId, taskId, apiId },
        'RE_CREATE_LOG_COLLECT'
      )
      try {
        await this.deleteLogCollectService.deleteHelper(uuid)
        const typeList = type.split(',')

        const startMoment = dayjs(Number(startTime))
        const endMoment = dayjs(Number(endTime))
        const origin = context.req.headers['origin']
        await this.createLogCollectService.createHelper(
          typeList,
          startMoment,
          endMoment,
          apiId,
          origin
        )
        await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
      } catch (err) {
        console.log('RE_CREATE_LOG_COLLECT', err)
        await this.zstackApiBase.recordFailed({ success: false, msg: err }, apiRecord)
        throw err
      }

      return {
        id: taskId
      }
    }

    this.actionHelper(input, 'LogCollect', actionFn)
    return { actionId }
  }
}
