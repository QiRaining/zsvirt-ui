import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  RefreshSharedblockDeviceCapacityAction,
  RefreshSharedBlockDeviceCapacityResult
} from '@/api/zstack/RefreshSharedblockDeviceCapacityAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RefreshSharedblockDeviceCapacityPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  sharedBlockGroupUuid: string
}

@InputType()
class RefreshSharedblockDeviceCapacityInput {
  @Field(() => [RefreshSharedblockDeviceCapacityPayload])
  payload: RefreshSharedblockDeviceCapacityPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RefreshSharedblockDeviceCapacityService extends ActionService {
  @Inject()
  refreshSharedblockDeviceCapacityAction: RefreshSharedblockDeviceCapacityAction

  @Mutation(() => ActionResult)
  refreshSharedblockDeviceCapacity(@Args('input') input: RefreshSharedblockDeviceCapacityInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'SharedBlock', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: RefreshSharedblockDeviceCapacityPayload, taskId: string) => {
      const result = (await this.refreshSharedblockDeviceCapacityAction.call(payload, {
        actionId,
        taskId
      })) as RefreshSharedBlockDeviceCapacityResult
      return {
        id: payload.uuid,
        fields: 'sshUsername, sshPassword, sshPort, monPort',
        inventory: result.inventory
      }
    }
  }
}
