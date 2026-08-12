import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { RevokeMonitorTemplateFromMonitorGroupAction } from '@/api/zstack/RevokeMonitorTemplateFromMonitorGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class RevokeMonitorTemplateFromMonitorGroupPayload {
  @Field(() => String)
  templateUuid: string

  @Field(() => String)
  groupUuid: string
}

@InputType()
class RevokeMonitorTemplateFromMonitorGroupInput {
  @Field(() => [RevokeMonitorTemplateFromMonitorGroupPayload])
  payload: RevokeMonitorTemplateFromMonitorGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class RevokeMonitorTemplateFromMonitorGroupService extends ActionService {
  @Inject()
  revokeMonitorTemplateFromMonitorGroupAction: RevokeMonitorTemplateFromMonitorGroupAction

  @Mutation(() => ActionResult)
  revokeMonitorTemplateFromMonitorGroup(
    @Args('input') input: RevokeMonitorTemplateFromMonitorGroupInput
  ) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'MonitorGroup',
      async (payload: RevokeMonitorTemplateFromMonitorGroupPayload, taskId: string) => {
        await this.revokeMonitorTemplateFromMonitorGroupAction.call(
          { ...payload },
          { actionId, taskId }
        )
        return {
          id: payload.groupUuid,
          fields: 'monitorTemplate,lastOpDate',
          inventory: {
            monitorTemplate: null
          }
        }
      }
    )
    return { actionId }
  }
}
