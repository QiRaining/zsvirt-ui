import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/sequelize'
import { Op, literal } from 'sequelize'

import { ResetGlobalConfigAction } from '@/api/zstack/ResetGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ZsUIConfig } from '@/model/zs-ui-config.model'

@InputType()
class ResetGlobalConfigPayload {
  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class ResetGlobalConfigInput {
  @Field(() => [ResetGlobalConfigPayload])
  payload: ResetGlobalConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ResetGlobalConfigService extends ActionService {
  @Inject() resetGlobalConfigAction: ResetGlobalConfigAction
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig

  @Mutation(() => ActionResult)
  resetGlobalConfig(@Args('input') input: ResetGlobalConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'GlobalConfig',
      async (payload: ResetGlobalConfigPayload, taskId: string) => {
        try {
          await this.zsUIConfig.update(
            { value: literal('defaultValue') },
            {
              where: {
                value: {
                  [Op.ne]: literal('defaultValue')
                }
              }
            }
          )
        } catch (error) {
          console.log('rest ZsUIConfig failed: ', error)
        }

        const result = await this.resetGlobalConfigAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )

        return {
          id: 'GlobalConfig',
          ...result
        }
      }
    )
    return { actionId }
  }
}
