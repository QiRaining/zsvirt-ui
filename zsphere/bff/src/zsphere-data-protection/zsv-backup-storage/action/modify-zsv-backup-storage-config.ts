import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AttachBackupStorageToZoneAction } from '@/api/zstack/AttachBackupStorageToZoneAction'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DetachBackupStorageFromZoneAction } from '@/api/zstack/DetachBackupStorageFromZoneAction'
import { UpdateImageStoreBackupStorageAction } from '@/api/zstack/UpdateImageStoreBackupStorageAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql'

@InputType()
class UpdateZSVBackupStorageConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true })
  attachedZoneUuids?: string[]

  @Field(() => [String], { nullable: true })
  detachedZoneUuids?: string[]

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  cidr?: string
}

@InputType()
class UpdateZSVBackupStorageConfigInput {
  @Field(() => [UpdateZSVBackupStorageConfigPayload])
  payload: UpdateZSVBackupStorageConfigPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateZSVBackupStorageConfigService extends ActionService {
  @Inject()
  updateImageStoreBackupStorageAction: UpdateImageStoreBackupStorageAction
  @Inject()
  attachBackupStorageToZoneAction: AttachBackupStorageToZoneAction
  @Inject()
  detachBackupStorageFromZoneAction: DetachBackupStorageFromZoneAction
  @Inject() zqlService: ZQLService
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction

  @Mutation(() => ActionResult)
  updateZSVBackupStorageConfig(@Args('input') input: UpdateZSVBackupStorageConfigInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateZSVBackupStorageConfigPayload, taskId: string) => {
      const {
        uuid,
        attachedZoneUuids,
        detachedZoneUuids,
        username,
        hostname,
        sshPort,
        name,
        description,
        cidr
      } = payload

      const { inventory } = await this.updateImageStoreBackupStorageAction.call(
        {
          uuid,
          name,
          description,
          username,
          hostname,
          sshPort
        },
        {
          actionId,
          taskId
        }
      )

      const zqlObject = {
        tableName: 'SystemTag',
        fields: ['uuid', 'tag'],
        condition: {
          resourceUuid: payload.uuid,
          resourceType: 'ImageStoreBackupStorageVO',
          tag: {
            [ZOp.like]: 'backup::network::cidr::'
          }
        }
      }
      const zql = ZQL.stringify(zqlObject)
      let backupNetworkTagUuid

      // 可能没有权限查询，所以加上 try catch。
      try {
        const respTag = await this.zqlService.call(zql)
        backupNetworkTagUuid = _.get(
          respTag,
          ['results', '0', 'inventories', '0', 'uuid'],
          undefined
        )
      } catch (error) {
        console.log(error)
      }

      if (backupNetworkTagUuid) {
        await this.updateSystemTagAction.call(
          {
            uuid: backupNetworkTagUuid,
            tag: `backup::network::cidr::${cidr}`
          },
          { actionId, taskId }
        )
      } else {
        await this.createSystemTagAction.call(
          {
            resourceType: 'ImageStoreBackupStorageVO',
            resourceUuid: uuid,
            tag: `backup::network::cidr::${cidr}`
          },
          { actionId, taskId }
        )
      }

      if (attachedZoneUuids.length > 0) {
        Promise.all(
          _.map(attachedZoneUuids, zoneUuid =>
            this.attachBackupStorageToZoneAction.call(
              { zoneUuid, backupStorageUuid: uuid },
              { actionId, taskId }
            )
          )
        )
      }

      if (detachedZoneUuids.length > 0) {
        Promise.all(
          _.map(detachedZoneUuids, zoneUuid =>
            this.detachBackupStorageFromZoneAction.call(
              { zoneUuid, backupStorageUuid: uuid },
              { actionId, taskId }
            )
          )
        )
      }

      return {
        id: payload.uuid,
        inventory
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn, {
      resourceUuids: input.payload.map(item => item.uuid)
    })
    return { actionId }
  }
}
