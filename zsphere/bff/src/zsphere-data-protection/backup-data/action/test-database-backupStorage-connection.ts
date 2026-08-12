import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { GetDatabaseBackupFromImageStoreAction } from '@/api/zstack/GetDatabaseBackupFromImageStoreAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { genUuid } from '@/utils'

@InputType()
class TestDatabaseBackupStorageConnectionPayload {
  @Field(() => String)
  url: string
}

@InputType()
class TestDatabaseBackupStorageConnectionInput {
  @Field(() => TestDatabaseBackupStorageConnectionPayload)
  payload: TestDatabaseBackupStorageConnectionPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class TestDatabaseBackupStorageConnectionService extends ActionService {
  @Inject()
  getDatabaseBackupFromImageStoreAction: GetDatabaseBackupFromImageStoreAction

  @Mutation(() => ActionResult)
  async testDatabaseBackupStorageConnection(
    @Args('input') input: TestDatabaseBackupStorageConnectionInput
  ) {
    const actionId = input.action.actionId
    const apiId = genUuid()
    this.actionHelper(
      input,
      'BackupData',
      async (payload: TestDatabaseBackupStorageConnectionPayload, taskId: string) => {
        const { backups = [] } = await this.getDatabaseBackupFromImageStoreAction.call(
          { url: payload.url },
          { actionId, taskId, apiId }
        )

        if (backups.length) {
          return {
            id: actionId,
            inventory: {
              success: true
            }
          }
        } else {
          await this.getDatabaseBackupFromImageStoreAction.recordFailed(
            {
              success: false,
              msg: 'Failed to connect to database backup storage'
            },
            {
              apiId
            }
          )

          throw {
            name: 'apiError',
            reason: {
              success: false,
              message: 'Failed to connect to database backup storage'
            }
          }
        }
      }
    )
    return { actionId }
  }
}
