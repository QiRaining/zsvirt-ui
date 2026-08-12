import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateChronyServersAction } from '@/api/zstack/UpdateChronyServersAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class UpdateTimeServerPayload {
  @Field(() => [String], { nullable: true, description: '内部时间源列表' })
  internal?: string[]

  @Field(() => [String], { nullable: true, description: '外部时间源列表' })
  external?: string[]
}

@InputType()
class UpdateTimeServerInput {
  @Field(() => UpdateTimeServerPayload)
  payload: UpdateTimeServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateTimeServerService extends ActionService {
  @Inject() updateChronyServersAction: UpdateChronyServersAction

  @Mutation(() => ActionResult)
  updateTimeServer(@Args('input') input: UpdateTimeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'TimeServer',
      async (payload: UpdateTimeServerPayload, taskId: string) => {
        const { internal, external } = payload
        await this.updateChronyServersAction.call(
          {
            internalHostnames: internal,
            externalHostnames: external
          },
          { actionId, taskId }
        )
        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
