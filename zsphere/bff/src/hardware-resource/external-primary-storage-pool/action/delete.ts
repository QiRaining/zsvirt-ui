import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionInfo } from '@/api/zstack/base/types'
import { UpdateExternalPrimaryStorageAction } from '@/api/zstack/UpdateExternalPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ActionExternalPrimaryStoragePoolPayload } from '../external-primary-storage-pool.model'

@InputType()
class DeleteExternalPrimaryStoragePoolInput {
  @Field(() => ActionExternalPrimaryStoragePoolPayload)
  payload: ActionExternalPrimaryStoragePoolPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteExternalPrimaryStoragePoolService extends ActionService {
  @Inject()
  deleteExternalPrimaryStoragePoolAction: UpdateExternalPrimaryStorageAction

  @Mutation(() => ActionResult)
  deleteExternalPrimaryStoragePool(@Args('input') input: DeleteExternalPrimaryStoragePoolInput) {
    const actionId = input.action.actionId

    this.actionHelper(input, 'PrimaryStorageVO', async (payload, taskId) => {
      return await this._action(payload, {
        taskId,
        actionId
      })
    })

    return { actionId }
  }

  async _action(payload: ActionExternalPrimaryStoragePoolPayload, actionInfo: ActionInfo) {
    const { config, ...params } = payload

    const _config = JSON.stringify(config)

    // 删除pool使用updateExternalPrimaryStorageAction
    const result = await this.deleteExternalPrimaryStoragePoolAction.call(
      Object.assign(params, { config: _config }),
      actionInfo
    )

    return {
      id: actionInfo.actionId,
      inventory: result.inventory
    }
  }
}
