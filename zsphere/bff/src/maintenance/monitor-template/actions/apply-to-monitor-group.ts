import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ApplyMonitorTemplateToMonitorGroupAction } from '@/api/zstack/ApplyMonitorTemplateToMonitorGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload {
  @Field(() => String)
  templateUuid: string

  @Field(() => String)
  groupUuid: string
}

@InputType()
class ApplyMonitorTemplateToMonitorGroupInMonitorTemplateInput {
  @Field(() => [ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload])
  payload: ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ApplyMonitorTemplateToMonitorGroupService extends ActionService {
  @Inject()
  applyMonitorTemplateToMonitorGroupAction: ApplyMonitorTemplateToMonitorGroupAction

  @Mutation(() => ActionResult)
  applyMonitorTemplateToMonitorGroupInMonitorTemplate(
    @Args('input')
    input: ApplyMonitorTemplateToMonitorGroupInMonitorTemplateInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'MonitorTemplate',
      async (
        payload: ApplyMonitorTemplateToMonitorGroupInMonitorTemplatePayload,
        taskId: string
      ) => {
        const { templateUuid, groupUuid } = payload
        await this.applyMonitorTemplateToMonitorGroupAction.call(
          {
            templateUuid,
            groupUuid
          },
          { actionId, taskId }
        )
        return {
          id: templateUuid
        }
      }
    )
    return { actionId }
  }
}
