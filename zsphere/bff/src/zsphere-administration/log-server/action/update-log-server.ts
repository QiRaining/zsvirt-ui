import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateLogServerAction } from '@/api/zstack/UpdateLogServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateLogServerPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string
}
@InputType()
class UpdateLogServerInput {
  @Field(() => UpdateLogServerPayload)
  payload: UpdateLogServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateLogServerService extends ActionService {
  @Inject() action: UpdateLogServerAction

  @Mutation(() => ActionResult)
  updateLogServer(@Args('input') input: UpdateLogServerInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateLogServerPayload, taskId: string) => {
      const { uuid, name, description } = payload
      await this.action.call(
        { uuid, name, description },
        {
          actionId,
          taskId
        }
      )
      return {
        id: uuid,
        fields: 'name,description,lastOpDate'
      }
    }

    this.actionHelper(input, 'LogServer', actionFn)

    return { actionId }
  }
}
