import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteHostSchedulingRuleGroupAction } from '@/api/zstack/DeleteHostSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteHostGroupPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteHostGroupInput {
  @Field(() => [DeleteHostGroupPayload])
  payload: DeleteHostGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteHostGroupService extends ActionService {
  @Inject()
  deleteHostSchedulingRuleGroupAction: DeleteHostSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  deleteHostGroup(@Args('input') input: DeleteHostGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostGroup',
      async (payload: DeleteHostGroupPayload, taskId: string) => {
        await this.deleteHostSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
