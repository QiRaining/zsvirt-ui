import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { DeleteVmNicFromSecurityGroupAction } from '@/api/zstack/DeleteVmNicFromSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class VmNicUnBindSecurityGroupPayload {
  @Field(() => String)
  vmNicUuid: string

  @Field(() => [String])
  securityGroupUuids: string[]
}

@InputType()
export class VmNicUnBindSecurityGroupInput {
  @Field(() => VmNicUnBindSecurityGroupPayload)
  payload: VmNicUnBindSecurityGroupPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class VmNicUnBindSecurityGroupService extends ActionService {
  @Inject()
  deleteVmNicFromSecurityGroupAction: DeleteVmNicFromSecurityGroupAction

  @Mutation(() => ActionResult)
  vmNicUnBindSecurityGroup(@Args('input') input: VmNicUnBindSecurityGroupInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmNic',
      async (payload: VmNicUnBindSecurityGroupPayload, taskId: string) => {
        return await this.actionFn(payload, taskId, actionId)
      }
    )

    return {
      actionId
    }
  }

  async actionFn(payload: VmNicUnBindSecurityGroupPayload, taskId: string, actionId: string) {
    const { vmNicUuid, securityGroupUuids } = payload

    await Promise.all(
      securityGroupUuids.map(sgUuid =>
        this.deleteVmNicFromSecurityGroupAction.call(
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
