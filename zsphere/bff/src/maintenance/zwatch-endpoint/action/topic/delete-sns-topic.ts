import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteSNSTopicAction } from '@/api/zstack/DeleteSNSTopicAction'
import { ActionService } from '@/base/action-service'
import { ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteSNSTopicInput {
  @Field(() => String)
  uuid: string
}

export class DeleteSNSTopicService extends ActionService {
  @Inject() deleteSNSTopicAction: DeleteSNSTopicAction

  @Mutation(() => ActionResult)
  async deleteSNSTopic(
    input: DeleteSNSTopicInput,
    actionInfo?: { actionId?: string; taskId?: string }
  ) {
    await this.deleteSNSTopicAction.call(
      { uuid: input.uuid },
      { actionId: actionInfo?.actionId, taskId: actionInfo?.taskId }
    )
    return {
      id: input.uuid
    }
  }
}
