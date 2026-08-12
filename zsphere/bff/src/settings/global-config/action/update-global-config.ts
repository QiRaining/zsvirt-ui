import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { UpdateGlobalConfigAction } from '@/api/zstack/UpdateGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsUIConfig } from '@/model/zs-ui-config.model'
import { genUuid } from '@/utils'

@InputType()
export class UpdateGlobalConfigPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { defaultValue: 'ui' })
  category: string

  @Field(() => String)
  value: string
}

@InputType()
export class UpdateGlobalConfigInput {
  @Field(() => [UpdateGlobalConfigPayload])
  payload: UpdateGlobalConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateGlobalConfigService extends ActionService {
  @Inject() updateGlobalConfigAction: UpdateGlobalConfigAction
  @Inject() zstackApiBase: ZStackApiBase
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig

  @Mutation(() => ActionResult)
  updateGlobalConfig(@Args('input') input: UpdateGlobalConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'GlobalConfig',
      async (payload: UpdateGlobalConfigPayload, taskId: string) => {
        const { category } = payload
        if (category === 'ui') {
          let apiRecord: any = {
            value: payload.value,
            category,
            name: payload.name
          }
          try {
            // 先修改记录
            await this.zsUIConfig.update(
              { value: payload.value },
              { where: { name: payload.name } }
            )
            // 再更新API 记录
            apiRecord = await this.zstackApiBase.recordStart(
              { value: payload.value, category, name: payload.name },
              { actionId, taskId, apiId: genUuid() },
              'UI_UpdateGlobalConfig'
            )
            await this.zstackApiBase.recordSuccess({ success: true }, apiRecord)
          } catch (error) {
            this.zstackApiBase.recordFailed(error, apiRecord)

            throw new Error(JSON.stringify(error))
          }
        } else {
          await this.updateGlobalConfigAction.call(
            {
              ...payload
            },
            { actionId, taskId }
          )
        }

        return {
          id: `${payload.category}.${payload.name}`,
          fields: 'value',
          inventory: { value: payload.value }
        }
      }
    )
    return { actionId }
  }
}
