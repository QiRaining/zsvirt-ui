import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmSchedulingRuleGroupAction } from '@/api/zstack/DeleteVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DeleteVmGroupPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class DeleteVmGroupInput {
  @Field(() => [DeleteVmGroupPayload])
  payload: DeleteVmGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmGroupService extends ActionService {
  @Inject()
  deleteVmSchedulingRuleGroupAction: DeleteVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  deleteVmGroup(@Args('input') input: DeleteVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmGroup', async (payload: DeleteVmGroupPayload, taskId: string) => {
      await this.deleteVmSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
      return {
        id: payload.uuid
      }
    })
    return { actionId }
  }
}
