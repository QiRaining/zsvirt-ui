import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RebootVmInstanceAction, RebootVmInstanceResult } from '@/api/zstack/RebootVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { CancelLongjobHelperService } from '@/zsphere-administration/operation-log/action/cancel-long-job'

@InputType()
class RebootVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true })
  backupTaskLongJobUuids?: string[]

  @Field(() => Boolean, { nullable: true })
  cancelBackupTask?: boolean
}

@InputType()
class RebootVmInstanceInput {
  @Field(() => [RebootVmInstancePayload])
  payload: RebootVmInstancePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RebootVmInstanceService extends ActionService {
  @Inject() rebootVmInstanceAction: RebootVmInstanceAction
  @Inject() cancelLongjobHelperService: CancelLongjobHelperService

  @Mutation(() => ActionResult)
  rebootVmInstance(@Args('input') input: RebootVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: RebootVmInstancePayload, taskId: string) => {
        const { uuid, cancelBackupTask, backupTaskLongJobUuids } = payload

        if (cancelBackupTask) {
          await Promise.all(
            backupTaskLongJobUuids?.map(longjobUuid =>
              this.cancelLongjobHelperService.call(
                {
                  longjobUuid
                },
                {
                  actionId,
                  taskId
                }
              )
            )
          )
        }
        const result: RebootVmInstanceResult = await this.rebootVmInstanceAction.call(
          { uuid },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'state',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
