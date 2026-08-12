import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import { SetVmClockTrackAction } from '@/api/zstack/SetVmClockTrackAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmClockTrackPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  clockTrack: string

  @Field(() => Boolean, { nullable: true })
  syncAfterVMResume: boolean

  @Field(() => Int, { nullable: true })
  intervalInSeconds: number
}

@InputType()
class SetVmClockTrackInput {
  @Field(() => [SetVmClockTrackPayload])
  payload: Array<SetVmClockTrackPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmClockTrackService extends ActionService {
  @Inject() setVmClockTrackAction: SetVmClockTrackAction

  @Mutation(() => ActionResult)
  setVmClockTrack(@Args('input') input: SetVmClockTrackInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmClockTrackPayload, taskId: string) => {
        return this.actionFn(payload, taskId, actionId)
      }
    )

    return { actionId }
  }

  async actionFn(payload: SetVmClockTrackPayload, taskId: string, actionId: string) {
    const { uuid, clockTrack, syncAfterVMResume, intervalInSeconds } = payload

    await this.setVmClockTrackAction.call(
      {
        uuid,
        track: clockTrack,
        syncAfterVMResume: syncAfterVMResume,
        intervalInSeconds: intervalInSeconds
      },
      { actionId, taskId }
    )

    // guest | host
    return {
      id: uuid,
      fields: 'systemTag { clockTrack }',
      inventory: { systemTag: { clockTrack } }
    }
  }
}
