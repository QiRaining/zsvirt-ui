import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddHostToHostSchedulingRuleGroupAction,
  AddHostToHostSchedulingRuleGroupResult
} from '@/api/zstack/AddHostToHostSchedulingRuleGroupAction'
import {
  CreateHostSchedulingRuleGroupAction,
  CreateHostSchedulingRuleGroupResult
} from '@/api/zstack/CreateHostSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateHostGroupPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String])
  hostUuids: string[]
}

@InputType()
class CreateHostGroupInput {
  @Field(() => CreateHostGroupPayload)
  payload: CreateHostGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateHostGroupService extends ActionService {
  @Inject()
  createHostSchedulingRuleGroupAction: CreateHostSchedulingRuleGroupAction
  @Inject()
  addHostToHostSchedulingRuleGroupAction: AddHostToHostSchedulingRuleGroupAction

  @Mutation(() => ActionResult)
  createHostGroup(@Args('input') input: CreateHostGroupInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'HostGroup',
      async (payload: CreateHostGroupPayload, taskId: string) => {
        const { name, description, zoneUuid, hostUuids } = payload
        const result: CreateHostSchedulingRuleGroupResult =
          await this.createHostSchedulingRuleGroupAction.call(
            { name, description, zoneUuid },
            { actionId, taskId }
          )
        if (hostUuids?.length) {
          const addHostTask = hostUuids.map(uuid => {
            this.addHostToHostSchedulingRuleGroupAction.call(
              {
                hostUuid: uuid,
                hostGroupUuid: result?.inventory?.uuid
              },
              { actionId, taskId }
            )
          })
          await Promise.all(addHostTask)
        }
        return {
          id: result.inventory.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
