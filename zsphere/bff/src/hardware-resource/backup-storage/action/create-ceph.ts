import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  AddCephBackupStorageAction,
  AddBackupStorageResult
} from '@/api/zstack/AddCephBackupStorageAction'
import { AttachBackupStorageToZoneAction } from '@/api/zstack/AttachBackupStorageToZoneAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddCephBackupStoragePayload {
  @Field(() => String)
  zoneUuid: string

  @Field(() => [String])
  monUrls: Array<string>

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  poolName?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  dataNetwork?: string

  @Field(() => [String], { nullable: true })
  systemTags?: Array<string>

  @Field(() => String, { nullable: true })
  reservedCapacity?: string

  @Field(() => String, { nullable: true })
  blobUploadConcurrency?: string

  @Field(() => String, { nullable: true })
  blobDownloadConcurrency?: string
}

@InputType()
class AddCephBackupStorageInput {
  @Field(() => AddCephBackupStoragePayload)
  payload: AddCephBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddCephBackupStorageService extends ActionService {
  @Inject() addCephBackupStorageAction: AddCephBackupStorageAction
  @Inject() attachBackupStorageToZoneAction: AttachBackupStorageToZoneAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  transform(inventory) {
    if (inventory.state) {
      inventory.state = inventory.state.toLowerCase()
    }
    return inventory
  }

  @Mutation(() => ActionResult)
  addCephBackupStorage(@Args('input') input: AddCephBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: AddCephBackupStoragePayload, taskId: string) => {
        try {
          const {
            reservedCapacity,
            blobUploadConcurrency,
            blobDownloadConcurrency,
            ...createBSPayload
          } = payload
          const result: AddBackupStorageResult = await this.addCephBackupStorageAction.call(
            { ...createBSPayload },
            { actionId, taskId }
          )
          // 高级设置
          if (reservedCapacity) {
            await this.updateResourceConfigAction.call(
              {
                resourceUuid: result?.inventory?.uuid,
                name: 'reservedCapacity',
                category: 'backupStorage',
                value: reservedCapacity
              },
              { actionId, taskId }
            )
          }
          if (blobUploadConcurrency) {
            await this.updateResourceConfigAction.call(
              {
                resourceUuid: result?.inventory?.uuid,
                name: 'blob.upload.concurrency',
                category: 'imagestore',
                value: blobUploadConcurrency
              },
              { actionId, taskId }
            )
          }
          if (blobDownloadConcurrency) {
            await this.updateResourceConfigAction.call(
              {
                resourceUuid: result?.inventory?.uuid,
                name: 'blob.download.concurrency',
                category: 'imagestore',
                value: blobDownloadConcurrency
              },
              { actionId, taskId }
            )
          }
          // 绑定区域
          if (result?.inventory?.uuid && payload.zoneUuid) {
            const attachResult = await this.attachBackupStorageToZoneAction.call(
              {
                zoneUuid: payload.zoneUuid,
                backupStorageUuid: result?.inventory?.uuid
              },
              {
                actionId,
                taskId
              }
            )
            return {
              id: result.inventory.uuid,
              inventory: attachResult.inventory
            }
          }
          return {
            id: result.inventory.uuid,
            inventory: result.inventory
          }
        } catch (e) {
          console.log(e)
        }
      }
    )
    return { actionId }
  }
}
