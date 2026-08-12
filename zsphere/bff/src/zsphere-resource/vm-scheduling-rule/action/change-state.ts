import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  ChangeVmSchedulingRuleStateAction,
  ChangeVmSchedulingRuleStateResult
} from '@/api/zstack/ChangeVmSchedulingRuleStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeVmSchedulingRuleStatePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  state: string
}

@InputType()
export class ChangeVmSchedulingRuleStateInput {
  @Field(() => [ChangeVmSchedulingRuleStatePayload])
  payload: ChangeVmSchedulingRuleStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVmSchedulingRuleStateService extends ActionService {
  @Inject()
  changeVmSchedulingRuleStateAction: ChangeVmSchedulingRuleStateAction

  @Mutation(() => ActionResult)
  changeVmSchedulingRuleState(@Args('input') input: ChangeVmSchedulingRuleStateInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmSchedulingRule',
      async (payload: ChangeVmSchedulingRuleStatePayload, taskId: string) => {
        const { uuid, state } = payload
        const result: ChangeVmSchedulingRuleStateResult =
          await this.changeVmSchedulingRuleStateAction.call({ uuid, state }, { actionId, taskId })

        return {
          id: payload.uuid,
          fields: 'state,lastOpDate,excuteState',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
