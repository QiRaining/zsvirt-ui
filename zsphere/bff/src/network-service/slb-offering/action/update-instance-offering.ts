import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Int } from '@nestjs/graphql'
import { String } from 'lodash'

import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { UpdateInstanceOfferingAction } from '@/api/zstack/UpdateInstanceOfferingAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSlbOfferingPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string
}

@InputType()
export class UpdateSlbOfferingInput {
  @Field(() => UpdateSlbOfferingPayload)
  payload: UpdateSlbOfferingPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSlbOfferingService extends ActionService {
  @Inject() updateInstanceOfferingAction: UpdateInstanceOfferingAction
  @Inject() querySystemTagsAction: QuerySystemTagAction
  @Inject() createSystemTagAction: CreateSystemTagAction
  @Inject() updateSystemTagAction: UpdateSystemTagAction

  @Mutation(() => ActionResult)
  updateSlbOffering(@Args('input') input: UpdateSlbOfferingInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'SlbOffering',
      async (payload: UpdateSlbOfferingPayload, taskId: string) => {
        const { inventory } = await this.updateInstanceOfferingAction.call(payload, {
          actionId,
          taskId
        })
        return {
          id: payload.uuid,
          fields: 'name, description',
          inventory
        }
      }
    )
    return { actionId }
  }
}
