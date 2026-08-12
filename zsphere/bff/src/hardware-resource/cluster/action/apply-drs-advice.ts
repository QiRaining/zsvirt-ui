import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ApplyDRSAdviceAction } from '@/api/zstack/ApplyDRSAdviceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class ApplyDRSAdvicePayload {
  @Field(() => String)
  adviceUuid: string
}

@InputType()
class ApplyDRSAdviceListInput {
  @Field(() => [ApplyDRSAdvicePayload])
  payload: ApplyDRSAdvicePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class ApplyDRSAdviceService extends ActionService {
  @Inject() applyDRSAdviceAction: ApplyDRSAdviceAction

  /**
   * 应用DRS建议("执行调度"按钮）
   * @param adviceUuid string
   */
  @Mutation(() => ActionResult)
  applyDRSAdvice(@Args('input') input: ApplyDRSAdviceListInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'DRSAdvice',
      async (payload: ApplyDRSAdvicePayload, taskId: string) => {
        const { adviceUuid } = payload
        await this.applyDRSAdviceAction.call({ adviceUuid }, { actionId, taskId })
        return {
          id: adviceUuid
        }
      }
    )
    return { actionId }
  }
}
