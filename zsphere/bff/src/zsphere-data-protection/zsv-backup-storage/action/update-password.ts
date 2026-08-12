import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateImageStoreBackupStorageAction } from '@/api/zstack/UpdateImageStoreBackupStorageAction'
import { UpdateSftpBackupStorageAction } from '@/api/zstack/UpdateSftpBackupStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateZSVBackupStoragePasswordPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
class UpdateZSVBackupStoragePasswordInput {
  @Field(() => [UpdateZSVBackupStoragePasswordPayload])
  payload: UpdateZSVBackupStoragePasswordPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateZSVBackupStoragePasswordService extends ActionService {
  @Inject()
  updateImageStoreBackupStorageAction: UpdateImageStoreBackupStorageAction
  @Inject()
  updateSftpBackupStorageAction: UpdateSftpBackupStorageAction

  @Mutation(() => ActionResult)
  UpdateZSVBackupStoragePassword(@Args('input') input: UpdateZSVBackupStoragePasswordInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateZSVBackupStoragePasswordPayload, taskId: string) => {
      const { type, password, uuid } = payload

      if (type === 'ImageStoreBackupStorage') {
        const { inventory } = await this.updateImageStoreBackupStorageAction.call(
          {
            uuid,
            password
          },
          {
            actionId,
            taskId
          }
        )
        return {
          id: payload.uuid,
          inventory
        }
      } else {
        const { inventory } = await this.updateSftpBackupStorageAction.call(
          { uuid, password },
          {
            actionId,
            taskId
          }
        )
        return {
          id: payload.uuid,
          inventory
        }
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
