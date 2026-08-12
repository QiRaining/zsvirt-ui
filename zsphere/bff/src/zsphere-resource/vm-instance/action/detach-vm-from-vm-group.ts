import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachVmFromVmSchedulingRuleGroupAction } from '@/api/zstack/DetachVmFromVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachVmFromVmGroupPayload {
  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  vmGroupUuid: string
}

@InputType()
export class DetachVmFromVmGroupInput {
  @Field(() => DetachVmFromVmGroupPayload)
  payload: DetachVmFromVmGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachVmFromVmGroupService extends ActionService {
  @Inject()
  detachVmFromVmSchedulingRuleGroupAction: DetachVmFromVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  detachVmFromVmGroup(@Args('input') input: DetachVmFromVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: DetachVmFromVmGroupPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }
  async actionFn(payload: DetachVmFromVmGroupPayload, taskId: string, actionId: string) {
    await this.detachVmFromVmSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
    return {
      id: payload.vmUuid,
      fields: 'vmGroup',
      inventory: {
        vmGroup: {
          uuid: payload.vmGroupUuid
        }
      }
    }
  }
}
