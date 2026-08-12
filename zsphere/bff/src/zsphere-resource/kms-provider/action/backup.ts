import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { BackupNkpAction } from '@/api/zstack/BackupNkpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class BackupNkpPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
class BackupNkpInput {
  @Field(() => BackupNkpPayload)
  payload!: BackupNkpPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class BackupNkpService extends ActionService {
  @Inject() backupNkpAction!: BackupNkpAction

  @Mutation(() => ActionResult)
  backupNkp(@Args('input') input: BackupNkpInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'KmsProvider', async (payload: BackupNkpPayload, taskId: string) => {
      const result = await this.backupNkpAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid,
        inventory: { content: result?.content }
      }
    })
    return { actionId }
  }
}
