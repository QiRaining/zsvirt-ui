import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Int, Field, registerEnumType } from '@nestjs/graphql'
import { pick as _pick, isEmpty as _isEmpty, reduce as _reduce, uniq as _uniq } from 'lodash'

import { AddSecurityGroupRuleAction } from '@/api/zstack/AddSecurityGroupRuleAction'
import { AddVmNicToSecurityGroupAction } from '@/api/zstack/AddVmNicToSecurityGroupAction'
import { AttachSecurityGroupToL3NetworkAction } from '@/api/zstack/AttachSecurityGroupToL3NetworkAction'
import { CreateSecurityGroupAction } from '@/api/zstack/CreateSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import {
  SecurityGroupRuleProtocolType,
  SecurityGroupRuleState,
  SecurityGroupRuleType
} from '@/common/enum'
import { ActionResult, ActionInput } from '@/common/model/action.model'

export enum SecurityGroupRulePolicy {
  ACCEPT = 'ACCEPT',
  DROP = 'DROP'
}

registerEnumType(SecurityGroupRulePolicy, {
  name: 'SecurityGroupRulePolicy'
})

@InputType()
export class AddRuleParam {
  @Field(() => SecurityGroupRuleType, { nullable: true })
  type?: SecurityGroupRuleType

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => Int, { nullable: true })
  startPort?: number

  @Field(() => Int, { nullable: true })
  endPort?: number

  @Field(() => SecurityGroupRuleProtocolType, { nullable: true })
  protocol?: SecurityGroupRuleProtocolType

  @Field(() => String, { nullable: true })
  allowedCidr?: string

  @Field(() => [String], { nullable: true })
  remoteSecurityGroupUuids?: string[] // 暂时好像没用

  @Field(() => String, { nullable: true })
  remoteSecurityGroupUuid?: string

  @Field(() => Int, { nullable: true })
  priority?: number

  @Field(() => SecurityGroupRulePolicy, { nullable: true })
  action?: SecurityGroupRulePolicy

  @Field(() => String, { nullable: true })
  srcIpRange?: string

  @Field(() => String, { nullable: true })
  dstIpRange?: string

  @Field(() => String, { nullable: true })
  srcPortRange?: string // 暂时后端没有启用这个字段，不管出入方向都是使用dstPortRange，在hooks种处理

  @Field(() => String, { nullable: true })
  dstPortRange?: string

  @Field(() => SecurityGroupRuleState)
  state: SecurityGroupRuleState

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
class CreateSecurityGroupPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  l3NetworkUuids?: string[]

  @Field(() => [AddRuleParam], {
    nullable: true
  })
  rules?: AddRuleParam[]

  @Field(() => [String], { nullable: true })
  vmNicUuids?: string[]
}

@InputType()
export class CreateSecurityGroupInput {
  @Field(() => CreateSecurityGroupPayload)
  payload: CreateSecurityGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateSecurityGroupService extends ActionService {
  @Inject() private createSecurityGroupAction: CreateSecurityGroupAction
  @Inject()
  private addVmNicToSecurityGroupAction: AddVmNicToSecurityGroupAction
  @Inject() private addSecurityGroupRuleAction: AddSecurityGroupRuleAction
  @Inject()
  private attachSecurityGroupToL3NetworkAction: AttachSecurityGroupToL3NetworkAction

  @Mutation(() => ActionResult)
  createSecurityGroup(
    @Args('input')
    input: CreateSecurityGroupInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'SecurityGroup',
      async (payload: CreateSecurityGroupPayload, taskId: string) => {
        const { l3NetworkUuids, vmNicUuids, rules } = payload

        const action = {
          actionId,
          taskId
        }

        const result = await this.createSecurityGroupAction.call(
          _pick(payload, ['name', 'description']),
          action
        )

        const securityGroupUuid = result.inventory.uuid

        if (securityGroupUuid) {
          if (!_isEmpty(l3NetworkUuids)) {
            await Promise.allSettled(
              _uniq(l3NetworkUuids).map(l3NetworkUuid =>
                this.attachSecurityGroupToL3NetworkAction.call(
                  { securityGroupUuid, l3NetworkUuid },
                  action
                )
              )
            )
          }

          if (!_isEmpty(vmNicUuids)) {
            await this.addVmNicToSecurityGroupAction.call(
              {
                securityGroupUuid,
                vmNicUuids: vmNicUuids
              },
              action
            )
          }

          if (!_isEmpty(rules)) {
            this.addSecurityGroupRuleAction.call(
              {
                securityGroupUuid,
                rules
              },
              action
            )
          }
        }

        return {
          id: securityGroupUuid
        }
      }
    )

    return { actionId }
  }
}
