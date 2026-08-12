import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetVmCleanTrafficAction } from '@/api/zstack/SetVmCleanTrafficAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmCleanTrafficPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  enable: boolean
}

@InputType()
class SetVmCleanTrafficInput {
  @Field(() => [SetVmCleanTrafficPayload])
  payload: SetVmCleanTrafficPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmCleanTrafficService extends ActionService {
  @Inject()
  action: SetVmCleanTrafficAction

  @Mutation(() => ActionResult)
  setVmCleanTraffic(@Args('input') input: SetVmCleanTrafficInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmCleanTrafficPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )
    return { actionId }
  }

  async actionFn(payload: SetVmCleanTrafficPayload, taskId: string, actionId: string) {
    await this.action.call(payload, {
      actionId,
      taskId
    })
    return {
      id: payload.uuid,
      fields: 'systemTag { antiSpoofing }',
      inventory: {
        systemTag: {
          antiSpoofing: payload.enable
        }
      }
    }
  }
}
