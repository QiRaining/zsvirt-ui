import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { UpdateThirdpartyAlertsAction } from '@/api/zstack/UpdateThirdpartyAlertsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
@InputType()
class UpdateThirdpartyAlertsPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true, defaultValue: 'Read' })
  updateReadStatus?: string
}

@InputType()
class UpdateThirdpartyAlertsWithActionPayload {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true, defaultValue: 'Read' })
  updateReadStatus?: string
}

@ObjectType()
class UpdateThirdpartyAlertsResp {
  @Field(() => Boolean, { nullable: true })
  success: boolean
}

@InputType()
class UpdateThirdpartyAlertsInput {
  @Field(() => [UpdateThirdpartyAlertsPayload])
  payload: UpdateThirdpartyAlertsPayload[]
}

@InputType()
class UpdateThirdpartyAlertsWithActionInput {
  @Field(() => [UpdateThirdpartyAlertsWithActionPayload])
  payload: UpdateThirdpartyAlertsWithActionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 调用UpdateThirdpartyAlerts
 *
 */
export class UpdateThirdpartyAlertsAsReadService extends ActionService {
  @Inject() updateThirdpartyAlertsAction: UpdateThirdpartyAlertsAction

  @Mutation(() => UpdateThirdpartyAlertsResp)
  async updateThirdpartyAlertsAsRead(@Args('input') input: UpdateThirdpartyAlertsInput) {
    await Promise.all(
      input.payload.map(payload => {
        this.updateThirdpartyAlertsAction.call(payload)
      })
    )

    return { success: true }
  }

  @Mutation(() => ActionResult)
  async updateThirdpartyAlertsAsReadWithAction(
    @Args('input') input: UpdateThirdpartyAlertsWithActionInput
  ) {
    const actionId = input.action.actionId
    const actionFn = async (payload: UpdateThirdpartyAlertsWithActionPayload, taskId: string) => {
      await this.updateThirdpartyAlertsAction.call(payload, {
        actionId,
        taskId
      })
      return { id: taskId }
    }

    this.actionHelper(input, 'ThirdpartyAlerts', actionFn)
    return { actionId }
  }
}
