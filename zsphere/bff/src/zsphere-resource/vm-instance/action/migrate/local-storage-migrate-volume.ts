import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { LocalStorageMigrateVolumeAction } from '@/api/zstack/LocalStorageMigrateVolumeAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CancelLongjobHelperService } from '@/zsphere-administration/operation-log/action/cancel-long-job'

@InputType()
class LocalStorageMigrateVolumePayload {
  @Field(() => String)
  volumeUuid: string

  @Field(() => String)
  destHostUuid: string

  @Field(() => [String], { nullable: true })
  backupTaskLongJobUuids?: string[]
}

@InputType()
class LocalStorageMigrateVolumeInput {
  @Field(() => LocalStorageMigrateVolumePayload)
  payload: LocalStorageMigrateVolumePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class LocalStorageMigrateVolumeService extends ActionService {
  @Inject() localStorageMigrateVolumeAction: LocalStorageMigrateVolumeAction
  @Inject() cancelLongjobHelperService: CancelLongjobHelperService

  @Mutation(() => ActionResult)
  localStorageMigrateVolume(@Args('input') input: LocalStorageMigrateVolumeInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Volume',
      async (payload: LocalStorageMigrateVolumePayload, taskId: string) => {
        const { volumeUuid, destHostUuid, backupTaskLongJobUuids } = payload

        if (!!backupTaskLongJobUuids?.length) {
          await Promise.all(
            backupTaskLongJobUuids?.map(longjobUuid =>
              this.cancelLongjobHelperService.call(
                {
                  longjobUuid
                },
                {
                  actionId,
                  taskId
                }
              )
            )
          )
        }
        await this.localStorageMigrateVolumeAction.call(
          { volumeUuid, destHostUuid },
          { actionId, taskId }
        )
        return {
          id: payload.volumeUuid
        }
      }
    )
    return { actionId }
  }
}
