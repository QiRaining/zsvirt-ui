import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateUsbDeviceAction, UpdateUsbDeviceResult } from '@/api/zstack/UpdateUsbDeviceAction'
import { ActionService } from '@/base/action-service'
import { UsbDeviceState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateUsbDevicePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}

@InputType()
class UpdateUsbDeviceInput {
  @Field(() => [UpdateUsbDevicePayload])
  payload: UpdateUsbDevicePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateUsbDeviceService extends ActionService {
  @Inject() updateUsbDeviceAction: UpdateUsbDeviceAction

  @Mutation(() => ActionResult)
  updateUsbDevice(@Args('input') input: UpdateUsbDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'UsbDevice',
      async (payload: UpdateUsbDevicePayload, taskId: string) => {
        const { uuid, state, name } = payload
        const result: UpdateUsbDeviceResult = await this.updateUsbDeviceAction.call(
          { uuid, name, state },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'state, name',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
