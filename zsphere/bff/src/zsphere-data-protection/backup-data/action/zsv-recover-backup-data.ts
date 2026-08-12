import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryVolumeBackupAction } from '@/api/zstack/QueryVolumeBackupAction'
import { StartVmInstanceAction } from '@/api/zstack/StartVmInstanceAction'
import { StopVmInstanceAction } from '@/api/zstack/StopVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { OverlapBackupService } from './recover-backup-data/overlap-backup.service'

@InputType()
export class ZSVRecoverBackupDataPayload {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => Boolean, { nullable: true })
  isStartVm?: boolean

  @Field(() => Boolean, { nullable: true })
  isStopVm?: boolean

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@InputType()
class ZSVRecoverBackupDataInput {
  @Field(() => ZSVRecoverBackupDataPayload)
  payload: ZSVRecoverBackupDataPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ZSVRecoverBackupDataService extends ActionService {
  @Inject() overlapBackupService: OverlapBackupService
  @Inject() stopVmInstanceAction: StopVmInstanceAction
  @Inject() startVmInstanceAction: StartVmInstanceAction
  @Inject() private queryVolumeBackupAction: QueryVolumeBackupAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  async zsvRecoverBackupData(@Args('input') input: ZSVRecoverBackupDataInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BackupData',
      async (payload: ZSVRecoverBackupDataPayload, taskId: string) => {
        const { uuid, isStopVm, isStartVm, vmUuid } = payload

        if (isStopVm) {
          await this.stopVmInstanceAction.call(
            { uuid: vmUuid, stopHA: 'true' },
            { actionId, taskId }
          )
        }

        const { inventories: [backupData] = [] } = await this.queryVolumeBackupAction.call({
          conditions: [
            {
              key: 'uuid',
              op: Op.eq,
              value: uuid
            }
          ]
        })

        //覆盖
        await this.overlapBackupService.call({ ...payload, withVolume: true }, backupData, {
          actionId,
          taskId
        })

        if (isStartVm) {
          const result = await this.startVmInstanceAction.call(
            { uuid: vmUuid },
            { actionId, taskId }
          )
          return {
            id: actionId,
            fields: 'state',
            inventory: result.inventory
          }
        }

        return {
          id: payload.uuid
        }
      }
    )

    return { actionId }
  }
}
