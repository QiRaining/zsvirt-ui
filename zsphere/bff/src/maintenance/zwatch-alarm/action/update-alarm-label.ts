import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateAlarmLabelAction } from '@/api/zstack/UpdateAlarmLabelAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateAlarmLabelPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  key: string

  @Field(() => String)
  operator: string

  @Field(() => String)
  value: string
}

@InputType()
class UpdateAlarmLabelInput {
  @Field(() => [UpdateAlarmLabelPayload])
  payload: UpdateAlarmLabelPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateAlarmLabelService extends ActionService {
  @Inject() updateAlarmLabelAction: UpdateAlarmLabelAction

  // 报警资源的添加、移除操作
  @Mutation(() => ActionResult)
  updateAlarmLabel(@Args('input') input: UpdateAlarmLabelInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateAlarmLabelPayload, taskId: string) => {
      const { inventory } = await this.updateAlarmLabelAction.call(payload, {
        actionId,
        taskId
      })

      return {
        id: inventory.uuid,
        inventory
      }
    }

    this.actionHelper(input, 'ZWatchAlarmVO', actionFn)
    return { actionId }
  }
}
