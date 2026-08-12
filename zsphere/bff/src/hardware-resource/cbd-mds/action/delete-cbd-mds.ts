import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'
import { filter as _filter } from 'lodash'

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
export class DeleteCbdMdsPayload {
  @Field(() => String, {
    description: '主存储UUID'
  })
  uuid: string

  @Field(() => [String], {
    description: '要删除的MDS节点IP地址'
  })
  mdsAddrs: string[]
}

@InputType()
class DeleteCbdMdsInput {
  @Field(() => DeleteCbdMdsPayload)
  payload: DeleteCbdMdsPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteCbdMdsService extends ActionService {
  @Inject()
  updateExternalPrimaryStorageAction: UpdateExternalPrimaryStorageAction
  @Inject()
  queryPrimaryStorageService: PrimaryStorageQueryService

  @Mutation(() => ActionResult)
  deleteCbdMds(@Args('input') input: DeleteCbdMdsInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: DeleteCbdMdsPayload, taskId: string) => {
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

  async _update(payload: DeleteCbdMdsPayload, actionInfo: ActionInfo) {
    const { mdsAddrs, ...params } = payload

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

    const filteredMdsUrls = _filter(mdsUrls, item => {
      const match = item.match(/@([\d.]+):\d+$/)
      const ip = match ? match[1] : null
      return !mdsAddrs.includes(ip)
    })

    const _config = {
      logicalPoolName,
      mdsUrls: filteredMdsUrls
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
