import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateMdevDeviceAction, UpdateMdevDeviceResult } from '@/api/zstack/UpdateMdevDeviceAction'
import { UpdatePciDeviceAction, UpdatePciDeviceResult } from '@/api/zstack/UpdatePciDeviceAction'
import { ActionService } from '@/base/action-service'
import { PciDeviceState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateVGPUDevicePayload {
  @Field(() => String)
  uuid: string

  @Field(() => PciDeviceState)
  state: PciDeviceState

  @Field(() => Boolean, { nullable: true })
  isMdevDevice?: boolean
}

@InputType()
class UpdateVGPUDeviceInput {
  @Field(() => [UpdateVGPUDevicePayload])
  payload: UpdateVGPUDevicePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

/**
 * 更新vGPU设备状态 - 启用、停用
 * 注意：需要判断设备类型，调用不同的api
 *
 */
export class UpdateVGPUDeviceService extends ActionService {
  @Inject() updatePciDeviceAction: UpdatePciDeviceAction
  @Inject() updateMdevDeviceAction: UpdateMdevDeviceAction

  @Mutation(() => ActionResult)
  updateVGPUDevice(@Args('input') input: UpdateVGPUDeviceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'gpuDeviceList',
      async (payload: UpdateVGPUDevicePayload, taskId: string) => {
        let result
        const { isMdevDevice, ...params } = payload
        if (isMdevDevice) {
          result = (await this.updateMdevDeviceAction.call(params, {
            actionId,
            taskId
          })) as UpdateMdevDeviceResult
        } else {
          result = (await this.updatePciDeviceAction.call(params, {
            actionId,
            taskId
          })) as UpdatePciDeviceResult
        }

        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
