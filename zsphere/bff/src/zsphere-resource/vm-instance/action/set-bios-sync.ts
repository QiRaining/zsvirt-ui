import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetVmBIOSTrackPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  clockTrack: string
}

@InputType()
class SetVmBIOSTrackInput {
  @Field(() => [SetVmBIOSTrackPayload])
  payload: Array<SetVmBIOSTrackPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmBIOSTrackService extends ActionService {
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  @Mutation(() => ActionResult)
  setVmBIOSTrack(@Args('input') input: SetVmBIOSTrackInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetVmBIOSTrackPayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )

    return { actionId }
  }

  async actionFn(payload: SetVmBIOSTrackPayload, taskId: string, actionId: string) {
    const { uuid, clockTrack } = payload

    // 防御：clockTrack 只允许 "host" | "guest"。
    // 早期前端在条件渲染下会传入 undefined/字符串 "undefined"，
    // 直接写库会破坏 vm.clock.track 全局配置语义，这里直接拒绝。
    if (clockTrack !== 'host' && clockTrack !== 'guest') {
      throw new Error(`Invalid clockTrack: ${String(clockTrack)} (expected "host" | "guest")`)
    }

    await this.updateResourceConfigAction.call(
      {
        name: 'vm.clock.track',
        category: 'vm',
        resourceUuid: uuid,
        value: clockTrack
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
