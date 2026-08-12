import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ZStackApiBase } from '@/api/zstack/base/zstack-api-base'
import { UpdateRoleAction, UpdateRoleResult } from '@/api/zstack/UpdateRoleAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateRoleApiConfigPayload {
  @Field(() => String)
  uuid: string

  @Field(() => [String], { nullable: true })
  createPolicies?: string[]

  @Field(() => [String], { nullable: true })
  deletePolicies?: string[]
}

@InputType()
class UpdateRoleApiConfigInput {
  @Field(() => UpdateRoleApiConfigPayload)
  payload: UpdateRoleApiConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateRoleApiConfigService extends ActionService {
  @Inject() updateRoleAction: UpdateRoleAction
  @Inject() zstackApiBase: ZStackApiBase

  @Mutation(() => ActionResult)
  updateRoleApiConfig(@Args('input') input: UpdateRoleApiConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Role',
      async (payload: UpdateRoleApiConfigPayload, taskId: string) => {
        const { uuid, deletePolicies, createPolicies } = payload

        const result: UpdateRoleResult = await this.updateRoleAction.call(
          { uuid, deletePolicies, createPolicies },
          { actionId, taskId }
        )

        return {
          id: uuid,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }
}
