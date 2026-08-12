import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { ActionInfo } from '@/api/zstack/base/types'
import {
  UpdateExternalPrimaryStorageAction,
  UpdateExternalPrimaryStorageResult
} from '@/api/zstack/UpdateExternalPrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { Decrypt } from '@/utils/aesCipher'

import { PrimaryStorageQueryService } from '../../primary-storage/primary-storage-query/primary-storage-query.service'

@InputType()
export class UpdateCbdMdsPayload {
  @Field(() => String, {
    description: '主存储UUID'
  })
  uuid: string

  @Field(() => String, {
    description: '要修改的MDS节点IP地址'
  })
  addr: string

  @Field(() => Int, {
    description: 'SSH端口',
    nullable: true
  })
  port?: number

  @Field(() => String, {
    description: '用户名',
    nullable: true
  })
  username?: string

  @Field(() => String, {
    description: '密码',
    nullable: true
  })
  password?: string
}

@InputType()
class UpdateCbdMdsInput {
  @Field(() => [UpdateCbdMdsPayload])
  payload: UpdateCbdMdsPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateCbdMdsService extends ActionService {
  @Inject()
  updateExternalPrimaryStorageAction: UpdateExternalPrimaryStorageAction
  @Inject()
  queryPrimaryStorageService: PrimaryStorageQueryService

  @Mutation(() => ActionResult)
  updateCbdMds(@Args('input') input: UpdateCbdMdsInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: UpdateCbdMdsPayload, taskId: string) => {
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

  async _update(payload: UpdateCbdMdsPayload, actionInfo: ActionInfo) {
    const {
      addr: newAddr,
      password: newSshPassword,
      username: newSshUsername,
      port: newSshport
    } = payload

    // 查询主存储信息
    const { list: primaryStorageList } = await this.queryPrimaryStorageService.query({
      conditions: [
        {
          key: 'uuid',
          op: Op.eq,
          value: payload.uuid
        }
      ]
    })

    if (!primaryStorageList?.length) {
      throw new Error(`Primary storage with UUID ${payload.uuid} not found`)
    }

    const primaryStorage = primaryStorageList?.[0] || {}

    const mdsInfoList = primaryStorage?.addonInfo?.mdsInfos

    const { logicalPoolName } = primaryStorage?.config || {}

    const updatedMdsUrls = mdsInfoList.map(mdsInfo => {
      let { password, username, port } = mdsInfo || {}
      const defaultMdsUrl = `${username}:${password}@${mdsInfo?.addr}:${port}`

      if (newAddr === mdsInfo?.addr) {
        if (newSshPassword) {
          password = Decrypt(newSshPassword)
        }
        if (newSshUsername) {
          username = newSshUsername
        }
        if (newSshport) {
          port = newSshport
        }

        return `${username}:${password}@${mdsInfo?.addr}:${port}`
      }
      return defaultMdsUrl
    })

    // 创建新的配置对象
    const updatedConfig = {
      logicalPoolName,
      mdsUrls: updatedMdsUrls
    }

    // 调用API更新主存储
    const result = await this.updateExternalPrimaryStorageAction.call(
      {
        uuid: payload.uuid,
        config: JSON.stringify(updatedConfig)
      },
      actionInfo
    )

    return {
      inventory: result.inventory
    }
  }
}
