import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeSchedulerStateAction } from '@/api/zstack/ChangeSchedulerStateAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL from '@/common/zql/index'

@InputType()
class ChangeSchedulerStateActionPayload {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  enable: boolean

  @Field(() => Boolean)
  isVm: boolean
}

@InputType()
class ChangeSchedulerStateActionInput {
  @Field(() => [ChangeSchedulerStateActionPayload])
  payload: ChangeSchedulerStateActionPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSchedulerStateActionService extends ActionService {
  @Inject() changeSchedulerStateAction: ChangeSchedulerStateAction
  @Inject() zqlService: ZQLService

  @Mutation(() => ActionResult)
  changeSchedulerState(@Args('input') input: ChangeSchedulerStateActionInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobForVmAndVolume',
      async (payload: ChangeSchedulerStateActionPayload, taskId: string) => {
        const { uuid, enable, isVm } = payload

        const zqlObject = {
          tableName: 'SchedulerJob',
          condition: {
            targetResourceUuid: uuid,
            jobClassName: isVm
              ? 'org.zstack.storage.backup.CreateVmBackupJob'
              : 'org.zstack.storage.backup.CreateVolumeBackupJob'
          }
        }

        const zql = ZQL.stringify(zqlObject)
        const { results } = await this.zqlService.call(zql)
        const schedulerJobUuid = results?.[0]?.inventories?.[0]?.uuid
        await this.changeSchedulerStateAction.call(
          { uuid: schedulerJobUuid, stateEvent: enable ? 'enable' : 'disable' },
          { actionId, taskId }
        )
        return {
          id: uuid,
          fields: 'backupTaskStatus',
          inventory: {
            backupTaskStatus: enable ? 'Enable' : 'Disable'
          }
        }
      }
    )
    return { actionId }
  }
}
