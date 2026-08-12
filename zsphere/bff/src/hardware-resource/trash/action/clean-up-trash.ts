import { Inject } from '@nestjs/common'
import { Mutation, Args, Int, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { CleanUpTrashOnBackupStorageAction } from '@/api/zstack/CleanUpTrashOnBackupStorageAction'
import { CleanUpTrashOnPrimaryStorageAction } from '@/api/zstack/CleanUpTrashOnPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { TrashQueryType } from '../trash.model'

@InputType()
class CleanUpTrashPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Int, { nullable: true })
  trashId: number

  @Field(() => TrashQueryType)
  type: TrashQueryType
}

@InputType()
class CleanUpTrashListInput {
  @Field(() => [CleanUpTrashPayload])
  payload: CleanUpTrashPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CleanUpTrashService extends ActionService {
  @Inject()
  cleanUpTrashOnBackupStorageAction: CleanUpTrashOnBackupStorageAction
  @Inject()
  cleanUpTrashOnPrimaryStorageAction: CleanUpTrashOnPrimaryStorageAction

  @Mutation(() => ActionResult)
  cleanUpTrashList(@Args('input') input: CleanUpTrashListInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Trash', this.action(actionId))
    return { actionId }
  }

  action(actionId) {
    return async (payload: CleanUpTrashPayload, taskId: string) => {
      let result
      const { type, ...params } = payload
      if (type === TrashQueryType.BackupStorage) {
        result = await this.cleanUpTrashOnBackupStorageAction.call(params, {
          actionId,
          taskId
        })
      } else {
        result = await this.cleanUpTrashOnPrimaryStorageAction.call(params, {
          actionId,
          taskId
        })
      }

      if (_.some(_.get(result, 'results', []), it => !it?.success)) {
        throw new Error('')
      }

      return {
        id: actionId,
        inventory: result?.result
      }
    }
  }
}
