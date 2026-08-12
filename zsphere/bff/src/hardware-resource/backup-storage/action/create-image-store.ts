import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'

import {
  AddImageStoreBackupStorageAction,
  AddImageStoreBackupStorageResult
} from '@/api/zstack/AddImageStoreBackupStorageAction'
import { AttachBackupStorageToZoneAction } from '@/api/zstack/AttachBackupStorageToZoneAction'
import { MountBlockDeviceAction } from '@/api/zstack/MountBlockDeviceAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddImageStoreBackupStoragePayload {
  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  hostname: string

  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => Int)
  sshPort: number

  @Field(() => String)
  url: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Boolean, { nullable: true })
  importImages?: boolean

  @Field(() => String, { nullable: true })
  dataNetwork?: string

  @Field(() => String, { nullable: true })
  syncImageNetwork?: string

  @Field(() => [String], { nullable: true })
  systemTags?: Array<string>

  @Field(() => String, { nullable: true })
  reservedCapacity?: string

  @Field(() => String, { nullable: true })
  blobUploadConcurrency?: string

  @Field(() => String, { nullable: true })
  blobDownloadConcurrency?: string

  @Field(() => String, { nullable: true })
  blockDevicePath?: string
}

@InputType()
class AddImageStoreBackupStorageInput {
  @Field(() => AddImageStoreBackupStoragePayload)
  payload: AddImageStoreBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddImageStoreBackupStorageService extends ActionService {
  @Inject() addImageStoreBackupStorageAction: AddImageStoreBackupStorageAction
  @Inject() mountBlockDeviceAction: MountBlockDeviceAction
  @Inject() attachBackupStorageToZoneAction: AttachBackupStorageToZoneAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction

  transform(inventory) {
    if (inventory.state) {
      inventory.state = inventory.state.toLowerCase()
    }
    return inventory
  }

  @Mutation(() => ActionResult)
  addImageStoreBackupStorage(@Args('input') input: AddImageStoreBackupStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BackupStorage',
      async (payload: AddImageStoreBackupStoragePayload, taskId: string) => {
        try {
          const {
            reservedCapacity,
            blobUploadConcurrency,
            blobDownloadConcurrency,
            blockDevicePath,
            ...createBSPayload
          } = payload

          if (blockDevicePath) {
            await this.mountBlockDeviceAction.call(
              {
                path: blockDevicePath,
                hostName: payload.hostname,
                password: payload.password,
                username: payload.username,
                sshPort: payload.sshPort,
                mountPoint: payload.url
              },
              { actionId, taskId }
            )
          }

          const result: AddImageStoreBackupStorageResult =
            await this.addImageStoreBackupStorageAction.call(
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
