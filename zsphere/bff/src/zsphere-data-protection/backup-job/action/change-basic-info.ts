import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { ChangeResourceOwnerAction } from '@/api/zstack/ChangeResourceOwnerAction'
import { QuerySchedulerJobGroupAction } from '@/api/zstack/QuerySchedulerJobGroupAction'
import { UpdateSchedulerJobAction } from '@/api/zstack/UpdateSchedulerJobAction'
import {
  UpdateSchedulerJobGroupAction,
  UpdateSchedulerJobGroupResult
} from '@/api/zstack/UpdateSchedulerJobGroupAction'
import { ActionService } from '@/base/action-service'
import { SchedulerJobGroupState } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { Parameters } from '@/zsphere-administration/scheduler-job/scheduler-job.model'

@InputType()
class ChangeSchedulerJobGroupBasicInfo {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SchedulerJobGroupState, { nullable: true })
  state?: SchedulerJobGroupState

  @Field(() => Parameters, { nullable: true })
  parameters?: Parameters
}

@InputType()
class ChangeSchedulerJobGroupBasicInfoInput {
  @Field(() => [ChangeSchedulerJobGroupBasicInfo])
  payload: ChangeSchedulerJobGroupBasicInfo[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ChangeSchedulerJobGroupStateService extends ActionService {
  @Inject() updateSchedulerJobGroupAction: UpdateSchedulerJobGroupAction
  @Inject() zqlService: ZQLService
  @Inject() querySchedulerJobGroupAction: QuerySchedulerJobGroupAction
  @Inject() updateSchedulerJobAction: UpdateSchedulerJobAction
  @Inject() changeResourceOwnerAction: ChangeResourceOwnerAction

  @Mutation(() => ActionResult)
  changeSchedulerJobGroupBasicInfo(@Args('input') input: ChangeSchedulerJobGroupBasicInfoInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SchedulerJobGroup',
      async (payload: ChangeSchedulerJobGroupBasicInfo, taskId: string) => {
        const result: UpdateSchedulerJobGroupResult = await this.updateSchedulerJobGroupAction.call(
          { ...payload },
          { actionId, taskId }
        )

        return {
          id: payload.uuid,
          fields: 'name,description,state,jobData,lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
