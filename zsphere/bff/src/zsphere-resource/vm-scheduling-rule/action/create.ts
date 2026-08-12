import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddHostToHostSchedulingRuleGroupAction,
  AddHostToHostSchedulingRuleGroupResult
} from '@/api/zstack/AddHostToHostSchedulingRuleGroupAction'
import {
  AddVmToVmSchedulingRuleGroupAction,
  AddVmToVmSchedulingRuleGroupResult
} from '@/api/zstack/AddVmToVmSchedulingRuleGroupAction'
import {
  CreateHostSchedulingRuleGroupAction,
  CreateHostSchedulingRuleGroupResult
} from '@/api/zstack/CreateHostSchedulingRuleGroupAction'
import {
  CreateVmSchedulingRuleAction
  // CreateVmSchedulingRuleResult
} from '@/api/zstack/CreateVmSchedulingRuleAction'
import {
  CreateVmSchedulingRuleGroupAction,
  CreateVmSchedulingRuleGroupResult
} from '@/api/zstack/CreateVmSchedulingRuleGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateVmSchedulingRulePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  mode: string

  @Field(() => String)
  rule: string

  // 已有云主机调度组
  @Field(() => String, { nullable: true })
  vmGroupUuid?: string

  // 新创建云主机调度组
  @Field(() => String, { nullable: true })
  vmGroupName?: string

  @Field(() => [String], { nullable: true })
  vmUuids?: string[]

  // 已有物理机调度组
  @Field(() => String, { nullable: true })
  hostGroupUuid?: string

  // 新创建物理机调度组
  @Field(() => String, { nullable: true })
  hostGroupName?: string

  @Field(() => [String], { nullable: true })
  hostUuids?: string[]
}

@InputType()
class CreateVmSchedulingRuleInput {
  @Field(() => CreateVmSchedulingRulePayload)
  payload: CreateVmSchedulingRulePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVmSchedulingRuleService extends ActionService {
  @Inject()
  createVmSchedulingRuleGroupAction: CreateVmSchedulingRuleGroupAction
  @Inject()
  addVmToVmSchedulingRuleGroupAction: AddVmToVmSchedulingRuleGroupAction
  @Inject()
  createHostSchedulingRuleGroupAction: CreateHostSchedulingRuleGroupAction
  @Inject()
  addHostToHostSchedulingRuleGroupAction: AddHostToHostSchedulingRuleGroupAction
  @Inject() createVmSchedulingRuleAction: CreateVmSchedulingRuleAction

  @Mutation(() => ActionResult)
  createVmSchedulingRule(@Args('input') input: CreateVmSchedulingRuleInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmSchedulingRule',
      async (payload: CreateVmSchedulingRulePayload, taskId: string) => {
        const {
          vmGroupName,
          vmUuids,
          hostGroupName,
          hostUuids,
          zoneUuid,
          vmGroupUuid,
          hostGroupUuid,
          ...params
        } = payload
        let _vmGroupUuid = vmGroupUuid
        let _hostGroupUuid = hostGroupUuid
        if (vmGroupName) {
          // 创建云主机调度组
          const vmGroupResult: CreateVmSchedulingRuleGroupResult =
            await this.createVmSchedulingRuleGroupAction.call(
              { name: vmGroupName, zoneUuid },
              { actionId, taskId }
            )
          _vmGroupUuid = vmGroupResult?.inventory?.uuid
          // 云主机绑定云主机调度组
          if (vmUuids?.length) {
            const addVmTask = vmUuids.map(async uuid => {
              return this.addVmToVmSchedulingRuleGroupAction
                .call(
                  {
                    vmUuid: uuid,
                    vmGroupUuid: _vmGroupUuid
                  },
                  { actionId, taskId }
                )
                .catch(error => {
                  Promise.reject(error)
                })
            })
            await Promise.all(addVmTask)
          }
        }

        if (hostGroupName) {
          // 创建物理机调度组
          const hostGroupResult: CreateHostSchedulingRuleGroupResult =
            await this.createHostSchedulingRuleGroupAction.call(
              { name: hostGroupName, zoneUuid },
              { actionId, taskId }
            )
          _hostGroupUuid = hostGroupResult?.inventory?.uuid
          if (hostUuids?.length) {
            const addHostTask = hostUuids.map(async uuid => {
              return this.addHostToHostSchedulingRuleGroupAction
                .call(
                  {
                    hostUuid: uuid,
                    hostGroupUuid: hostGroupResult?.inventory?.uuid
                  },
                  { actionId, taskId }
                )
                .catch(error => {
                  return Promise.reject(error)
                })
            })
            await Promise.all(addHostTask)
          }
        }
        const result = await this.createVmSchedulingRuleAction.call(
          {
            zoneUuid,
            vmGroupUuid: _vmGroupUuid,
            hostGroupUuid: _hostGroupUuid,
            ...params
          },
          { actionId, taskId }
        )
        return {
          id: result.inventory.uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
