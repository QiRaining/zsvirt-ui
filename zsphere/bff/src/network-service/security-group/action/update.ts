import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateSecurityGroupAction } from '@/api/zstack/UpdateSecurityGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateSecurityGroupPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
export class UpdateSecurityGroupInput {
  @Field(() => [UpdateSecurityGroupPayload])
  payload: UpdateSecurityGroupPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateSecurityGroupService extends ActionService {
  @Inject()
  action: UpdateSecurityGroupAction

  @Mutation(() => ActionResult)
  updateSecurityGroup(@Args('input') input: UpdateSecurityGroupInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: UpdateSecurityGroupPayload, taskId: string) => {
      const { inventory } = await this.action.call(payload, {
        actionId,
        taskId
      })
      return {
        id: inventory.uuid,
        fields: 'name,description,lastOpDate',
        inventory
      }
    }

    this.actionHelper(input, 'SecurityGroup', actionFn)
    return { actionId }
  }
}
