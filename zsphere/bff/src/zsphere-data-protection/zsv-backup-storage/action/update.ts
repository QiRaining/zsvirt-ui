import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateBackupStorageAction } from '@/api/zstack/UpdateBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateZSVBackupStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@InputType()
class UpdateZSVBackupStorageInput {
  @Field(() => [UpdateZSVBackupStoragePayload])
  payload: UpdateZSVBackupStoragePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateZSVBackupStorageService extends ActionService {
  @Inject()
  updateBackupStorageAction: UpdateBackupStorageAction

  @Mutation(() => ActionResult)
  updateZSVBackupStorage(@Args('input') input: UpdateZSVBackupStorageInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateZSVBackupStoragePayload, taskId: string) => {
      await this.updateBackupStorageAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
