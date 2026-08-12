import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddExternalPrimaryStorageAction,
  AddExternalPrimaryStorageActionParam
} from '@/api/zstack/AddExternalPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateExternalPrimaryStoragePayload {
  @Field(() => String)
  name: string

  @Field(() => String, {
    nullable: true,
    description: '值为 Addon 时统一表示外部存储，配合 defaultOutputProtocol 的值确定具体存储类型'
  })
  type?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String, { description: '厂商名' })
  identity: string

  @Field(() => String, {
    description: '外部主存储的协议，比如：Vhost'
  })
  defaultOutputProtocol: string

  @Field(() => String, {
    nullable: true,
    description: 'cbd类型的ps不从ui传递url，由后端返回'
  })
  url?: string

  @Field(() => String, {
    description: '配置项，比如："{ pools: [pool1, pool2] }"'
  })
  config: string

  @Field(() => String, {
    nullable: true
  })
  resourceUuid?: string

  @Field(() => [String], {
    nullable: true
  })
  systemTags?: [string]

  @Field(() => [String], {
    nullable: true
  })
  tagUuids?: [string]

  @Field(() => [String], {
    nullable: true
  })
  userTags?: [string]
}

@InputType()
class CreateExternalPrimaryStorageInput {
  @Field(() => CreateExternalPrimaryStoragePayload)
  payload: CreateExternalPrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateExternalPrimaryStorageService extends ActionService {
  @Inject()
  addExternalPrimaryStorageAction: AddExternalPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction

  @Mutation(() => ActionResult)
  createExternalPrimaryStorage(@Args('input') input: CreateExternalPrimaryStorageInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateExternalPrimaryStoragePayload, taskId: string) => {
        const { inventory } = await this._create(payload, {
          actionId,
          taskId
        })

        return {
          id: inventory?.uuid,
          inventory
        }
      }
    )

    return { actionId }
  }

  async _create(payload: CreateExternalPrimaryStoragePayload, actionInfo: ActionInfo) {
    const { clusterUuid, ...params } = payload

    const resp = await this.addExternalPrimaryStorageAction.call(
      params as AddExternalPrimaryStorageActionParam,
      actionInfo
    )
    const attachCluterParam = {
      primaryStorageUuid: resp?.inventory?.uuid,
      clusterUuid
    }

    if (clusterUuid && resp?.inventory?.uuid) {
      await this.attachPrimaryStorageToClusterAction.call(
        attachCluterParam as AttachPrimaryStorageToClusterActionParam,
        actionInfo
      )
    }

    return {
      inventory: resp?.inventory
    }
  }
}
