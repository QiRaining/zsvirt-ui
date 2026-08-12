import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { SetImageBootModeAction } from '@/api/zstack/SetImageBootModeAction'
import { UpdateImageAction } from '@/api/zstack/UpdateImageAction'
import { ActionService } from '@/base/action-service'
import { CpuArchitecture, ImageBootMode, ImagePlatform } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateImagePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => String, { nullable: true })
  guestOsType?: string

  @Field(() => String, { nullable: true })
  bootMode?: string

  @Field(() => Boolean, { nullable: true })
  virtio?: boolean

  @Field(() => ImagePlatform, { nullable: true })
  platform: ImagePlatform

  @Field(() => String, { nullable: true })
  format: string

  @Field(() => String, { nullable: true })
  mediaType: string
}

@InputType()
class UpdateImageInput {
  @Field(() => [UpdateImagePayload])
  payload: UpdateImagePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateImageService extends ActionService {
  @Inject() updateImageAction: UpdateImageAction
  @Inject() setImageBootModeAction: SetImageBootModeAction

  @Mutation(() => ActionResult)
  updateImage(@Args('input') input: UpdateImageInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: UpdateImagePayload, taskId: string) => {
      const { bootMode, ...data } = payload
      const result = await this.updateImageAction.call(
        {
          ...data
        },
        { actionId, taskId }
      )
      let _bootMode = bootMode
      // 切换操作系统为 非 'Windows', 'Windows 7', 'WindowsServer 2008' 时关闭 csm
      if (
        !['Windows', 'Windows 7', 'WindowsServer 2008'].includes(payload?.guestOsType) &&
        bootMode === ImageBootMode.UEFI_WITH_CSM
      ) {
        _bootMode = ImageBootMode.UEFI
        await this.setImageBootModeAction.call(
          {
            uuid: payload.uuid,
            bootMode: _bootMode
          },
          { actionId, taskId }
        )
      }
      return {
        id: payload.uuid,
        fields: `${Object.keys(payload).join(',')},lastOpDate`,
        inventory: { ...result.inventory, bootMode: _bootMode }
      }
    })
    return { actionId }
  }
}
