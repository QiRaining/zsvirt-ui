import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { CreateResourceAttributeKeyAction } from '@/api/zstack/CreateResourceAttributeKeyAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateResourceAttributeConstraintPayload {
  @Field(() => String)
  type: string

  @Field(() => String)
  parameter: string
}

@InputType()
export class CreateResourceAttributeKeyPayload {
  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  resourceTypes?: string[]

  @Field(() => [CreateResourceAttributeConstraintPayload], { nullable: true })
  constraints?: CreateResourceAttributeConstraintPayload[]
}

@InputType()
export class CreateResourceAttributeKeyInput {
  @Field(() => CreateResourceAttributeKeyPayload)
  payload: CreateResourceAttributeKeyPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateResourceAttributeKeyService extends ActionService {
  @Inject()
  private createResourceAttributeKeyAction: CreateResourceAttributeKeyAction

  @Mutation(() => ActionResult)
  createResourceAttributeKey(@Args('input') input: CreateResourceAttributeKeyInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'ResourceAttributeKey',
      async (payload: CreateResourceAttributeKeyPayload, taskId: string) => {
        const result = await this.createResourceAttributeKeyAction.call(payload, {
          actionId,
          taskId
        })
        return { id: result?.inventory?.uuid }
      }
    )
    return { actionId }
  }
}
