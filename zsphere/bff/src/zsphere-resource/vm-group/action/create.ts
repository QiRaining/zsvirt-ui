import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddVmToVmSchedulingRuleGroupAction,
  AddVmToVmSchedulingRuleGroupResult
} from '@/api/zstack/AddVmToVmSchedulingRuleGroupAction'
import {
  CreateVmSchedulingRuleGroupAction,
  CreateVmSchedulingRuleGroupResult
} from '@/api/zstack/CreateVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateVmGroupPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  vmUuids?: string[]
}

@InputType()
class CreateVmGroupInput {
  @Field(() => CreateVmGroupPayload)
  payload: CreateVmGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVmGroupService extends ActionService {
  @Inject()
  createVmSchedulingRuleGroupAction: CreateVmSchedulingRuleGroupAction
  @Inject()
  addVmToVmSchedulingRuleGroupAction: AddVmToVmSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  createVmGroup(@Args('input') input: CreateVmGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmGroup', async (payload: CreateVmGroupPayload, taskId: string) => {
      const { name, description, zoneUuid, vmUuids } = payload
      const result: CreateVmSchedulingRuleGroupResult =
        await this.createVmSchedulingRuleGroupAction.call(
          { name, description, zoneUuid },
          { actionId, taskId }
        )
      if (vmUuids?.length) {
        const addVmTask = vmUuids.map(uuid => {
          this.addVmToVmSchedulingRuleGroupAction.call(
            {
              vmUuid: uuid,
              vmGroupUuid: result?.inventory?.uuid
            },
            { actionId, taskId }
          )
        })
        await Promise.all(addVmTask)
      }
      return {
        id: result.inventory.uuid,
        inventory: result.inventory
      }
    })
    return { actionId }
  }
}
