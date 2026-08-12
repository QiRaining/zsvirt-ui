import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { DeleteBaremetalChassisAction } from '@/api/zstack/DeleteBaremetalChassisAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class DeleteBaremetalChassisPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
class DeleteBaremetalChassisInput {
  @Field(() => [DeleteBaremetalChassisPayload])
  payload: Array<DeleteBaremetalChassisPayload>

  @Field(() => ActionInput)
  action: ActionInput
}

export class DeleteBaremetalChassisService extends ActionService {
  @Inject() deleteBaremetalChassisAction: DeleteBaremetalChassisAction

  @Mutation(() => ActionResult)
  deleteBaremetalChassis(@Args('input') input: DeleteBaremetalChassisInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'BaremetalChassis',
      async ({ uuid }: DeleteBaremetalChassisPayload, taskId: string) => {
        await this.deleteBaremetalChassisAction.call({ uuid }, { actionId, taskId })

        return {
          id: uuid
        }
      }
    )

    return { actionId }
  }
}
