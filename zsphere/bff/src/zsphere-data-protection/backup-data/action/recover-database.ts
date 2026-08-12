import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RecoverDatabaseFromBackupAction } from '@/api/zstack/RecoverDatabaseFromBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { RecoverDatabaseStatus, RecoverDatabaseWebSocketClient } from '../port-web-socket'

@InputType()
class RecoverDatabaseBackupInput {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  backupInstallPath?: string

  @Field(() => String, { nullable: true })
  backupStorageUrl?: string

  @Field(() => String)
  mysqlRootPassword: string
}

@InputType()
class RecoverDatabaseBackupActionInput {
  @Field(() => RecoverDatabaseBackupInput)
  payload: RecoverDatabaseBackupInput

  @Field(() => ActionInput)
  action: ActionInput
}

export class RecoverDatabaseService extends ActionService {
  @Inject() recoverDatabaseFromBackupAction: RecoverDatabaseFromBackupAction
  @Inject() recoverDatabaseWebSocketClient: RecoverDatabaseWebSocketClient

  @Mutation(() => ActionResult)
  async recoverDatabaseBackup(@Args('input') input: RecoverDatabaseBackupActionInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BackupData',
      async (payload: RecoverDatabaseBackupInput, taskId: string) => {
        const { logListenPort } = await this.recoverDatabaseFromBackupAction.call(payload, {
          actionId,
          taskId
        })

        return new Promise((res, rej) => {
          this.recoverDatabaseWebSocketClient.initServer(
            logListenPort,
            this.getSessionId(),
            (status: RecoverDatabaseStatus) => {
              const canLogin = [
                RecoverDatabaseStatus.Success,
                RecoverDatabaseStatus.StartFailed
              ].includes(status)
              if (canLogin) {
                return res({
                  id: payload?.uuid,
                  inventory: {
                    status
                  }
                })
              }
              return rej({
                status
              })
            }
          )
        })
      }
    )
    return { actionId }
  }
}
