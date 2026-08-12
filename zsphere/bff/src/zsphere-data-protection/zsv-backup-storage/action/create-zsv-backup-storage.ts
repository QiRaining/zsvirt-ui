import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { AddImageStoreBackupStorageAction } from '@/api/zstack/AddImageStoreBackupStorageAction'
import { AttachBackupStorageToZoneAction } from '@/api/zstack/AttachBackupStorageToZoneAction'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { MountBlockDeviceAction } from '@/api/zstack/MountBlockDeviceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { ScanDataZSVBackupStorageService } from './scan-data'

@InputType()
class CreateZSVBackupStoragePayload {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  addMethod?: string

  @Field(() => String, { nullable: true })
  imageStoreUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  cidr?: string

  @Field(() => Boolean, { nullable: true })
  scanBackup?: boolean

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  blockDevicePath?: string

  @Field(() => Boolean, { nullable: true })
  formatDisk?: boolean
}

@InputType()
class CreateZSVBackupStorageInput {
  @Field(() => CreateZSVBackupStoragePayload)
  payload: CreateZSVBackupStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateZSVBackupStorageService extends ActionService {
  @Inject()
  addImageStoreBackupStorageAction: AddImageStoreBackupStorageAction
  @Inject()
  mountBlockDeviceAction: MountBlockDeviceAction
  @Inject()
  createSystemTagAction: CreateSystemTagAction
  @Inject()
  attachBackupStorageToZoneAction: AttachBackupStorageToZoneAction

  @Inject() scanDataZSVBackupStorageService: ScanDataZSVBackupStorageService

  @Mutation(() => ActionResult)
  createZSVBackupStorage(@Args('input') input: CreateZSVBackupStorageInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateZSVBackupStoragePayload, taskId: string) => {
      const {
        cidr,
        imageStoreUuid,
        scanBackup,
        zoneUuid,
        addMethod,
        username,
        url,
        password,
        name,
        hostname,
        description,
        sshPort,
        formatDisk,
        blockDevicePath
      } = payload

      if (addMethod === 'localFromImageStorage') {
        if (cidr) {
          await this.createSystemTagAction.call(
            {
              resourceUuid: imageStoreUuid,
              resourceType: 'ImageStoreBackupStorageVO',
              tag: `backup::network::cidr::${cidr}`
            },
            { actionId, taskId }
          )
        }

        await this.createSystemTagAction.call(
          {
            resourceUuid: imageStoreUuid,
            resourceType: 'ImageStoreBackupStorageVO',
            tag: 'allowbackup'
          },
          { actionId, taskId }
        )

        if (scanBackup) {
          const scanResult = await this.scanDataZSVBackupStorageService.scanDataAction(
            {
              uuid: imageStoreUuid,
              currentZoneUuid: zoneUuid
            },
            actionId,
            taskId
          )
          return {
            id: scanResult.id,
            inventory: { scanResult: scanResult.inventory }
          }
        }
      }

      if (['localCreate', 'remoteCreate', 'localFromHost'].includes(addMethod)) {
        if (formatDisk) {
          await this.mountBlockDeviceAction.call(
            {
              path: blockDevicePath,
              hostName: hostname,
              password,
              username,
              sshPort,
              mountPoint: url
            },
            { actionId, taskId }
          )
        }

        const systemTags: string[] =
          addMethod === 'remoteCreate' ? ['remotebackup'] : ['onlybackup']

        if (cidr) {
          systemTags.push(`backup::network::cidr::${cidr}`)
        }

        const { inventory } = await this.addImageStoreBackupStorageAction.call(
          {
            name,
            description: description ? description : '',
            hostname,
            password,
            username,
            sshPort,
            url,
            systemTags
          },
          { actionId, taskId }
        )

        await this.attachBackupStorageToZoneAction.call(
          { zoneUuid: zoneUuid, backupStorageUuid: inventory.uuid },
          { actionId, taskId }
        )

        if (scanBackup) {
          const scanResult = await this.scanDataZSVBackupStorageService.scanDataAction(
            {
              uuid: inventory.uuid,
              backupStorageType: addMethod === 'remoteCreate' ? 'remotebackup' : 'local',
              currentZoneUuid: zoneUuid
            },
            actionId,
            taskId
          )
          return {
            id: scanResult.id,
            inventory: { scanResult: scanResult.inventory }
          }
        }
      }

      return {
        id: actionId,
        inventory: { uuid: imageStoreUuid }
      }
    }

    this.actionHelper(input, 'ZSVBackupStorage', actionFn)
    return { actionId }
  }
}
