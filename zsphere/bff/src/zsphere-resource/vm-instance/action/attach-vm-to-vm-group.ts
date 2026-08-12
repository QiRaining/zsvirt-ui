import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddVmToVmSchedulingRuleGroupAction } from '@/api/zstack/AddVmToVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachVmToVmGroupPayload {
  @Field(() => String)
  vmUuid: string

  @Field(() => String)
  vmGroupUuid: string
}

@InputType()
export class AttachVmToVmGroupInput {
  @Field(() => [AttachVmToVmGroupPayload])
  payload: AttachVmToVmGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachVmToVmGroupService extends ActionService {
  @Inject()
  addVmToVmSchedulingRuleGroupAction: AddVmToVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  attachVmToVmGroup(@Args('input') input: AttachVmToVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: AttachVmToVmGroupPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: AttachVmToVmGroupPayload, taskId: string, actionId: string) {
    await this.addVmToVmSchedulingRuleGroupAction.call({ ...payload }, { actionId, taskId })
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
