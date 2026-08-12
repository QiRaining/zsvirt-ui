import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Mutation } from '@nestjs/graphql'

import { DeleteNicQosAction } from '@/api/zstack/DeleteNicQosAction'
import { SetNicQosAction } from '@/api/zstack/SetNicQosAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetNicQosPayload {
  @Field(() => String, { description: '网卡的uuid' })
  uuid: string

  @Field(() => Float, { description: '上行带宽', nullable: true })
  outboundBandwidth?: number

  @Field(() => Float, { description: '下行带宽', nullable: true })
  inboundBandwidth?: number
}

@InputType()
class SetNicQosInput {
  @Field(() => SetNicQosPayload)
  payload: SetNicQosPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetNicQosService extends ActionService {
  @Inject() SetNicQosAction: SetNicQosAction
  @Inject() DeleteNicQosAction: DeleteNicQosAction

  @Mutation(() => ActionResult)
  setNicQos(@Args('input') input: SetNicQosInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'VmNic', async (payload: SetNicQosPayload, taskId: string) => {
      return await this.actionFn(payload, taskId, actionId)
    })
    return { actionId }
  }

  async actionFn(payload: SetNicQosPayload, taskId: string, actionId: string) {
    if (!payload.inboundBandwidth) {
      await this.DeleteNicQosAction.call(
        { uuid: payload.uuid, direction: 'in' },
        { actionId, taskId }
      )
    }
    if (!payload.outboundBandwidth) {
      await this.DeleteNicQosAction.call(
        { uuid: payload.uuid, direction: 'out' },
        { actionId, taskId }
      )
    }
    if (payload.outboundBandwidth || payload.inboundBandwidth) {
      await this.SetNicQosAction.call(payload, {
        actionId,
        taskId
      })
    }
    return {
      id: payload.uuid,
      fields: 'outboundBandwidth,inboundBandwidth',
      inventory: {
        outboundBandwidth: payload.outboundBandwidth,
        inboundBandwidth: payload.inboundBandwidth
      }
    }
  }
}
