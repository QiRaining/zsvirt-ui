import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ActionInfo } from '@/api/zstack/base/types'
import {
  UpdateExternalPrimaryStorageAction,
  UpdateExternalPrimaryStorageResult
} from '@/api/zstack/UpdateExternalPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { PrimaryStorageQueryService } from '../../primary-storage/primary-storage-query/primary-storage-query.service'

@InputType()
export class AddCbdMdsPayload {
  @Field(() => String, {
    description: '主存储UUID'
  })
  uuid: string

  @Field(() => String)
  mdsUrl: string
}

@InputType()
class AddCbdMdsInput {
  @Field(() => AddCbdMdsPayload)
  payload: AddCbdMdsPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddCbdMdsService extends ActionService {
  @Inject()
  updateExternalPrimaryStorageAction: UpdateExternalPrimaryStorageAction
  @Inject()
  queryPrimaryStorageService: PrimaryStorageQueryService

  @Mutation(() => ActionResult)
  addCbdMds(@Args('input') input: AddCbdMdsInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: AddCbdMdsPayload, taskId: string) => {
        const result: UpdateExternalPrimaryStorageResult = await this._update(payload, {
          actionId,
          taskId
        })

        return {
          id: payload.uuid,
          inventory: result.inventory
        }
      }
    )

    return { actionId }
  }

  async _update(payload: AddCbdMdsPayload, actionInfo: ActionInfo) {
    const { mdsUrl, ...params } = payload

    const { list: psList } = await this.queryPrimaryStorageService.query({
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: params.uuid
        }
      ]
    })

    const { logicalPoolName, mdsUrls } = psList?.[0]?.config

    const _config = {
      logicalPoolName,
      mdsUrls: [...mdsUrls, mdsUrl]
    }

    const result = await this.updateExternalPrimaryStorageAction.call(
      Object.assign(params, { config: JSON.stringify(_config) }),
      actionInfo
    )

    return {
      inventory: result.inventory
    }
  }
}
