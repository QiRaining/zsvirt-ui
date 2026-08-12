import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AddVmNicToSecurityGroupAction } from '@/api/zstack/AddVmNicToSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class VmNicBindSecurityGroupPayload {
  @Field(() => String)
  vmNicUuid: string

  @Field(() => [String])
  securityGroupUuids: string[]
}

@InputType()
export class VmNicBindSecurityGroupInput {
  @Field(() => VmNicBindSecurityGroupPayload)
  payload: VmNicBindSecurityGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class VmNicBindSecurityGroupService extends ActionService {
  @Inject()
  addVmNicToSecurityGroupAction: AddVmNicToSecurityGroupAction

  @Mutation(() => ActionResult)
  vmNicBindSecurityGroup(@Args('input') input: VmNicBindSecurityGroupInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmNic',
      async (payload: VmNicBindSecurityGroupPayload, taskId: string) => {
        return await this.actionFn(payload, actionId, taskId)
      }
    )

    return {
      actionId
    }
  }

  async actionFn(payload: VmNicBindSecurityGroupPayload, taskId: string, actionId: string) {
    const { vmNicUuid, securityGroupUuids } = payload

    await Promise.all(
      securityGroupUuids.map(sgUuid =>
        this.addVmNicToSecurityGroupAction.call(
          {
            vmNicUuids: [vmNicUuid],
            securityGroupUuid: sgUuid
          },
          { actionId, taskId }
        )
      )
    )

    return {
      id: vmNicUuid
    }
  }
}
