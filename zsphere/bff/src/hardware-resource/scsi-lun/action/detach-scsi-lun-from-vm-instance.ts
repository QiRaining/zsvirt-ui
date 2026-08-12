import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DetachScsiLunFromVmInstanceAction } from '@/api/zstack/DetachScsiLunFromVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class DetachScsiLunFromVmInstancePayload {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '云主机UUID' })
  vmInstanceUuid: string
}

@InputType()
class DetachScsiLunFromVmInstanceInput {
  @Field(() => [DetachScsiLunFromVmInstancePayload])
  payload: DetachScsiLunFromVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class DetachScsiLunFromVmInstanceService extends ActionService {
  @Inject()
  detachScsiLunFromVmInstanceAction: DetachScsiLunFromVmInstanceAction

  @Mutation(() => ActionResult)
  detachScsiLunFromVmInstance(
    @Args('input')
    input: DetachScsiLunFromVmInstanceInput
  ) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'ScsiLun',
      async (payload: DetachScsiLunFromVmInstancePayload, taskId: string) =>
        await this.actionFn(payload, taskId, actionId)
    )

    return { actionId }
  }

  async actionFn(
    { uuid, ...rest }: DetachScsiLunFromVmInstancePayload,
    taskId: string,
    actionId: string
  ) {
    await this.detachScsiLunFromVmInstanceAction.call(
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
