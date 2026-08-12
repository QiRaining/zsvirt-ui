import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'
import { isEmpty as _isEmpty, omit as _omit } from 'lodash'

import { AttachSecurityGroupToL3NetworkAction } from '@/api/zstack/AttachSecurityGroupToL3NetworkAction'
import { ChangeVmNicSecurityPolicyAction } from '@/api/zstack/ChangeVmNicSecurityPolicyAction'
import { SetVmNicSecurityGroupAction } from '@/api/zstack/SetVmNicSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { VmNicSecurityPolicyEnum } from '../vm-nic.model'

@InputType()
export class SecurityGroupRefs {
  @Field(() => String)
  securityGroupUuid: string

  @Field(() => Int)
  priority: number

  @Field(() => [String], { nullable: true, defaultValue: [] })
  attachedL3NetworkUuids: string[]
}

@InputType()
export class SetVmNicSecurityGroupPayload {
  @Field(() => String)
  vmNicUuid: string

  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => [SecurityGroupRefs])
  securityGroupRefs: SecurityGroupRefs[]

  @Field(() => VmNicSecurityPolicyEnum, { nullable: true })
  ingressPolicy?: VmNicSecurityPolicyEnum

  @Field(() => VmNicSecurityPolicyEnum, { nullable: true })
  egressPolicy?: VmNicSecurityPolicyEnum
}

@InputType()
export class SetVmNicSecurityGroupInput {
  @Field(() => SetVmNicSecurityGroupPayload)
  payload: SetVmNicSecurityGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmNicSecurityGroupService extends ActionService {
  @Inject()
  setVmNicSecurityGroupAction: SetVmNicSecurityGroupAction
  @Inject()
  changeVmNicSecurityPolicyAction: ChangeVmNicSecurityPolicyAction
  @Inject()
  private attachSecurityGroupToL3NetworkAction: AttachSecurityGroupToL3NetworkAction

  @Mutation(() => ActionResult)
  setVmNicSecurityGroup(@Args('input') input: SetVmNicSecurityGroupInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmNic',
      async (payload: SetVmNicSecurityGroupPayload, taskId: string) => {
        return await this.actionFn(payload, { actionId, taskId })
      }
    )

    return {
      actionId
    }
  }

  async actionFn(
    payload: SetVmNicSecurityGroupPayload,
    action: { actionId: string; taskId: string }
  ) {
    const { vmNicUuid, l3NetworkUuid, securityGroupRefs, ingressPolicy, egressPolicy } = payload

    if (!_isEmpty(securityGroupRefs)) {
      try {
        await Promise.allSettled(
          securityGroupRefs.map(({ securityGroupUuid, attachedL3NetworkUuids }) => {
            if (!attachedL3NetworkUuids.includes(l3NetworkUuid)) {
              this.attachSecurityGroupToL3NetworkAction.call(
                {
                  securityGroupUuid,
                  l3NetworkUuid
                },
                action
              )
            }
          })
        )
      } catch (e) {}
    }

    await this.setVmNicSecurityGroupAction.call(
      {
        vmNicUuid,
        refs: securityGroupRefs.map(it => _omit(it, ['attachedL3NetworkUuids']))
      },
      action
    )

    if (ingressPolicy && egressPolicy) {
      await this.changeVmNicSecurityPolicyAction.call(
        { vmNicUuid, ingressPolicy, egressPolicy },
        action
      )
    }

    return {
      id: action.actionId
    }
  }
}
