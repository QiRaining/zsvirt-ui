import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ChangeVmNicStateAction } from '@/api/zstack/ChangeVmNicStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class ChangeVmNicStatePayload {
  @Field(() => String)
  vmNicUuid: string

  @Field(() => String)
  state: string
}

@InputType()
class ChangeVmNicStateInput {
  @Field(() => [ChangeVmNicStatePayload])
  payload: ChangeVmNicStatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeVmNicStateService extends ActionService {
  @Inject() ChangeVmNicStateAction: ChangeVmNicStateAction

  @Mutation(() => ActionResult)
  changeVmNicState(@Args('input') input: ChangeVmNicStateInput) {
    const actionId = input.action.actionId

    // 由前端触发，不然在云主机详情页会反复刷新
    this.actionHelper(input, 'None', async (payload: ChangeVmNicStatePayload, taskId: string) =>
      this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: ChangeVmNicStatePayload, taskId: string, actionId: string) {
    const res = await this.ChangeVmNicStateAction.call(payload, {
      actionId,
      taskId
    })
    return {
      id: payload.vmNicUuid,
      fields: 'state',
      inventory: res.inventory
    }
  }
}
