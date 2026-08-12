import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CalculateImageHashAction } from '@/api/zstack/CalculateImageHashAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CalcHashPayload {
  @Field(() => String)
  backupStorageUuid: string
  @Field(() => String)
  uuid: string
}

@InputType()
class CalcHashInput {
  @Field(() => [CalcHashPayload])
  payload: CalcHashPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class CalcHashService extends ActionService {
  @Inject()
  calculateImageHashAction: CalculateImageHashAction

  @Mutation(() => ActionResult)
  calcHash(@Args('input') input: CalcHashInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Image', async (payload: CalcHashPayload, taskId: string) => {
      await this.calculateImageHashAction.call(payload, {
        actionId,
        taskId
      })
      return {
        id: payload.uuid,
        inventory: {
          actionType: 'calcHash',
          id: payload.uuid
        }
      }
    })
    return { actionId }
  }
}
