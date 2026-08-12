import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, Float, Int } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryVolumeBackupAction } from '@/api/zstack/QueryVolumeBackupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { DiskAO } from '@/zsphere-resource/vm-instance/action/zsv/create-instance'

import { CreateVmFromVmBackupService } from './recover-backup-data/create-vm-from-vm-backup.service'

@InputType()
export class ZSVCreateVmFromBackupDataPayload {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => Float, { nullable: true, description: '内存预留大小' })
  reservedMemorySize?: number

  @Field(() => String, { nullable: true })
  primaryStorageUuidForRootVolume?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => [String], { nullable: true })
  l3NetworkUuids: string[]

  @Field(() => [String], { nullable: true })
  systemTags: string[]

  @Field(() => [String], { nullable: true })
  dataVolumeSystemTags: string[]

  @Field(() => [String], { nullable: true })
  rootVolumeSystemTags: string[]

  @Field(() => [DiskAO], { nullable: true })
  diskAOs?: DiskAO[]

  @Field(() => String, { nullable: true })
  vmNicParams?: string

  @Field(() => Boolean, { nullable: true })
  resetTpm?: boolean
}

@InputType()
class ZSVCreateVmFromBackupDataInput {
  @Field(() => ZSVCreateVmFromBackupDataPayload)
  payload: ZSVCreateVmFromBackupDataPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZSVCreateVmFromBackupDataService extends ActionService {
  @Inject() createVmFromVmBackupService: CreateVmFromVmBackupService
  @Inject() private queryVolumeBackupAction: QueryVolumeBackupAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  async zsvCreateVmFromBackupData(@Args('input') input: ZSVCreateVmFromBackupDataInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BackupData',
      async (payload: ZSVCreateVmFromBackupDataPayload, taskId: string) => {
        const { uuid } = payload
        const { inventories: [backupData] = [] } = await this.queryVolumeBackupAction.call({
          conditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: uuid
            }
          ]
        })

        await this.createVmFromVmBackupService.call(payload, backupData, {
          actionId,
          taskId
        })

        return {
          id: payload.uuid
        }
      }
    )

    return { actionId }
  }
}
