import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdateMonitorGroupAction,
  UpdateMonitorGroupResult
} from '@/api/zstack/UpdateMonitorGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { GroupActionsInput } from './create'

@InputType()
export class UpdateMonitorGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [GroupActionsInput], { nullable: true })
  actions: GroupActionsInput[]
}

@InputType()
class UpdateMonitorGroupInput {
  @Field(() => UpdateMonitorGroupPayload)
  payload: UpdateMonitorGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateMonitorGroupService extends ActionService {
  @Inject() updateMonitorGroupAction: UpdateMonitorGroupAction

  @Mutation(() => ActionResult)
  updateMonitorGroup(@Args('input') input: UpdateMonitorGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'MonitorGroup',
      async (payload: UpdateMonitorGroupPayload, taskId: string) => {
        const result: UpdateMonitorGroupResult = await this.updateMonitorGroupAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'name,description,actions,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
