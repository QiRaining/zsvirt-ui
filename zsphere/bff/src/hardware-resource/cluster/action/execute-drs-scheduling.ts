import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ExecuteDRSSchedulingAction } from '@/api/zstack/ExecuteDRSSchedulingAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ExecuteDRSSchedulingPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class ExecuteDRSSchedulingInput {
  @Field(() => [ExecuteDRSSchedulingPayload])
  payload: ExecuteDRSSchedulingPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ExecuteDRSSchedulingService extends ActionService {
  @Inject() executeDRSSchedulingAction: ExecuteDRSSchedulingAction

  /**
   * 手动触发DRS调度（"平衡状态扫描"按钮）
   * @param uuid string drsUuid
   */
  @Mutation(() => ActionResult)
  executeDRSScheduling(@Args('input') input: ExecuteDRSSchedulingInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ClusterDRS',
      async (payload: ExecuteDRSSchedulingPayload, taskId: string) => {
        const { uuid } = payload
        await this.executeDRSSchedulingAction.call({ uuid }, { actionId, taskId })
        return {
          id: payload.uuid
        }
      }
    )
    return { actionId }
  }
}
