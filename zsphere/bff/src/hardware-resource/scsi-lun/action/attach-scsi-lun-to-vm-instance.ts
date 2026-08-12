import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AttachScsiLunToVmInstanceAction } from '@/api/zstack/AttachScsiLunToVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class AttachScsiLunToVmInstancePayload {
  @Field(() => String, { description: 'SCSI LUN的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '云主机UUID' })
  vmInstanceUuid: string

  @Field(() => Boolean, {
    nullable: true,
    description: '关闭自动加载多路径设备',
    defaultValue: false
  })
  disableMultiPathAttach?: boolean
}

@InputType()
class AttachScsiLunToVmInstanceInput {
  @Field(() => [AttachScsiLunToVmInstancePayload])
  payload: AttachScsiLunToVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class AttachScsiLunToVmInstanceService extends ActionService {
  @Inject() attachScsiLunToVmInstanceAction: AttachScsiLunToVmInstanceAction

  @Mutation(() => ActionResult)
  attachScsiLunToVmInstances(
    @Args('input')
    input: AttachScsiLunToVmInstanceInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'ScsiLun',
      async (payload: AttachScsiLunToVmInstancePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )

    return { actionId }
  }

  async actionFn(
    { uuid, ...rest }: AttachScsiLunToVmInstancePayload,
    taskId: string,
    actionId: string
  ) {
    await this.attachScsiLunToVmInstanceAction.call(
      {
        uuid,
        ...rest
      },
      { actionId, taskId }
    )

    return {
      id: uuid
    }
  }
}
