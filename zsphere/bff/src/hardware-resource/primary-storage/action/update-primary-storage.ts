import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import {
  UpdatePrimaryStorageAction,
  UpdatePrimaryStorageResult
} from '@/api/zstack/UpdatePrimaryStorageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdatePrimaryStoragePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
class UpdatePrimaryStorageInput {
  @Field(() => UpdatePrimaryStoragePayload)
  payload: UpdatePrimaryStoragePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdatePrimaryStorageService extends ActionService {
  @Inject() updatePrimaryStorageAction: UpdatePrimaryStorageAction

  @Mutation(() => ActionResult)
  updatePrimaryStorage(@Args('input') input: UpdatePrimaryStorageInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'PrimaryStorageVO',
      async (payload: UpdatePrimaryStoragePayload, taskId: string) => {
        const result: UpdatePrimaryStorageResult = await this.updatePrimaryStorageAction.call(
          {
            ...payload
          },
          { actionId, taskId }
        )
        return {
          id: payload.uuid,
          fields: 'name, description, lastOpDate',
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
