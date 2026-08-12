import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import {
  AddLocalPrimaryStorageAction,
  AddLocalPrimaryStorageActionParam
} from '@/api/zstack/AddLocalPrimaryStorageAction'
import {
  AttachPrimaryStorageToClusterAction,
  AttachPrimaryStorageToClusterActionParam
} from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { ActionInfo } from '@/api/zstack/base/types'
import { MountBlockDeviceAction } from '@/api/zstack/MountBlockDeviceAction'
import { QueryHostAction } from '@/api/zstack/QueryHostAction'
import { ActionService } from '@/base/action-service'
import { Op } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateLocalPrimaryStorageInputPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  url: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => [String], { nullable: true })
  systemTags?: [string]

  @Field(() => [String], { nullable: true })
  blockDevicePaths?: string[]

  @Field(() => [String], { nullable: true })
  hostUuids?: string[]
}

@InputType()
export class CreateLocalPrimaryStorageInput {
  @Field(() => CreateLocalPrimaryStorageInputPayload)
  payload: CreateLocalPrimaryStorageInputPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateLocalStoragePrimaryStorageService extends ActionService {
  @Inject()
  addLocalPrimaryStorageAction: AddLocalPrimaryStorageAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction
  @Inject() queryHostAction: QueryHostAction
  @Inject() mountBlockDeviceAction: MountBlockDeviceAction

  @Mutation(() => ActionResult)
  createLocalStoragePrimaryStorage(@Args('input') input: CreateLocalPrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: CreateLocalPrimaryStorageInputPayload, taskId: string) => {
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

  _create = async (params: CreateLocalPrimaryStorageInputPayload, actionInfo: ActionInfo) => {
    const { clusterUuid, blockDevicePaths, hostUuids, ...param } = params

    if (blockDevicePaths?.length) {
      const { inventories } = await this.queryHostAction.call({
        conditions: [
          {
            key: 'uuid',
            op: Op.in,
            values: hostUuids
          }
        ]
      })

      // Map来存储 hostUuid -> blockDevicePath 的映射
      const blockDevicePathMap = new Map(
        hostUuids.map((uuid, index) => [uuid, blockDevicePaths[index]])
      )

      const mountBlockDeviceParams = inventories.map(inventory => {
        return {
          username: inventory.username,
          sshPort: Number(inventory.sshPort),
          hostName: inventory.managementIp,
          path: blockDevicePathMap.get(inventory.uuid),
          mountPoint: params.url
        }
      })

      for (let i = 0; i < mountBlockDeviceParams.length; i++) {
        await this.mountBlockDeviceAction.call(
          {
            ...mountBlockDeviceParams[i]
          },
          actionInfo
        )
      }
    }

    const resp = await this.addLocalPrimaryStorageAction.call(
      param as AddLocalPrimaryStorageActionParam,
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
      id: resp?.inventory?.uuid,
      fields: 'name,description',
      inventory: resp?.inventory
    }
  }
}
