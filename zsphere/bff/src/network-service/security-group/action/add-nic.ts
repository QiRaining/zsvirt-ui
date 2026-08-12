import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { uniq as _uniq } from 'lodash'

import { AddVmNicToSecurityGroupAction } from '@/api/zstack/AddVmNicToSecurityGroupAction'
import { AttachSecurityGroupToL3NetworkAction } from '@/api/zstack/AttachSecurityGroupToL3NetworkAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddVmNicToSecurityGroupPayload {
  @Field(() => [String])
  vmNicUuids: string[]

  @Field(() => String)
  securityGroupUuid: string

  @Field(() => [String], { nullable: true, defaultValue: [] })
  l3NetworkUuids?: string[]
}

@InputType()
class AddVmNicToSecurityGroupInput {
  @Field(() => [AddVmNicToSecurityGroupPayload])
  payload: AddVmNicToSecurityGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddVmNicToSecurityGroupService extends ActionService {
  @Inject() addVmNicToSecurityGroupAction: AddVmNicToSecurityGroupAction
  @Inject()
  private attachSecurityGroupToL3NetworkAction: AttachSecurityGroupToL3NetworkAction

  @Mutation(() => ActionResult)
  addVmNicToSecurityGroup(@Args('input') input: AddVmNicToSecurityGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: AddVmNicToSecurityGroupPayload, taskId: string) => {
      const action = {
        actionId,
        taskId
      }

      const { l3NetworkUuids, ...rest } = payload

      await Promise.allSettled(
        _uniq(l3NetworkUuids).map(l3NetworkUuid =>
          this.attachSecurityGroupToL3NetworkAction.call(
            { securityGroupUuid: payload.securityGroupUuid, l3NetworkUuid },
            action
          )
        )
      )

      await this.addVmNicToSecurityGroupAction.call(rest, {
        actionId,
        taskId
      })
      return {
        id: payload.securityGroupUuid
      }
    }

    this.actionHelper(input, 'VmNic', actionFn)
    return { actionId }
  }
}
