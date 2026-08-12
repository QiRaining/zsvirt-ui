import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { UpdateResourceAttributeKeyAction } from '@/api/zstack/UpdateResourceAttributeKeyAction'
import { ActionService } from '@/base/action-service'
import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import { CreateResourceAttributeConstraintPayload } from './create-key'

@InputType()
export class UpdateResourceAttributeKeyPayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  resourceTypes?: string[]

  @Field(() => [CreateResourceAttributeConstraintPayload], { nullable: true })
  createConstraints?: CreateResourceAttributeConstraintPayload[]

  @Field(() => [BigInt], { nullable: true })
  deleteConstraintIds?: number[]
}

@InputType()
export class UpdateResourceAttributeKeyInput {
  @Field(() => UpdateResourceAttributeKeyPayload)
  payload: UpdateResourceAttributeKeyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateResourceAttributeKeyService extends ActionService {
  @Inject()
  private updateResourceAttributeKeyAction: UpdateResourceAttributeKeyAction

  @Mutation(() => ActionResult)
  updateResourceAttributeKey(@Args('input') input: UpdateResourceAttributeKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceAttributeKey',
      async (payload: UpdateResourceAttributeKeyPayload, taskId: string) => {
        const result = await this.updateResourceAttributeKeyAction.call(payload, {
          actionId,
          taskId
        })
        return { id: result?.inventory?.uuid }
      }
    )
    return { actionId }
  }
}
