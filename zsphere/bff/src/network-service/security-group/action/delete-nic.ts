import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteVmNicFromSecurityGroupAction } from '@/api/zstack/DeleteVmNicFromSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteVmNicFromSecurityGroupPayload {
  @Field(() => [String])
  vmNicUuids: string[]

  @Field(() => String)
  securityGroupUuid: string
}

@InputType()
class DeleteVmNicFromSecurityGroupInput {
  @Field(() => [DeleteVmNicFromSecurityGroupPayload])
  payload: DeleteVmNicFromSecurityGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteVmNicFromSecurityGroupService extends ActionService {
  @Inject()
  action: DeleteVmNicFromSecurityGroupAction

  @Mutation(() => ActionResult)
  deleteVmNicFromSecurityGroup(@Args('input') input: DeleteVmNicFromSecurityGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: DeleteVmNicFromSecurityGroupPayload, taskId: string) => {
      await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.securityGroupUuid,
        inventory: {}
      }
    }

    this.actionHelper(input, 'VmNic', actionFn)
    return { actionId }
  }
}
