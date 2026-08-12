import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { CreateKmsAction } from '@/api/zstack/CreateKmsAction'
import { CreateNkpAction } from '@/api/zstack/CreateNkpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateKmsParam {
  @Field(() => String)
  endpoint!: string

  @Field(() => Int)
  port!: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
export class CreateKmsProviderPayload {
  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => CreateKmsParam, { nullable: true })
  createKmsParam?: CreateKmsParam
}

@InputType()
class CreateKmsProviderInput {
  @Field(() => CreateKmsProviderPayload)
  payload!: CreateKmsProviderPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class CreateKmsProviderService extends ActionService {
  @Inject() createKmsAction!: CreateKmsAction
  @Inject() createNkpAction!: CreateNkpAction

  @Mutation(() => ActionResult)
  createKmsProvider(@Args('input') input: CreateKmsProviderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: CreateKmsProviderPayload, taskId: string) => {
        const { name, description, createKmsParam } = payload
        let result: { inventory?: { uuid?: string } } | undefined
        if (createKmsParam) {
          result = await this.createKmsAction.call(
            { name, description, ...createKmsParam },
            { actionId, taskId }
          )
        } else {
          result = await this.createNkpAction.call({ name, description }, { actionId, taskId })
        }
        return {
          id: result?.inventory?.uuid,
          inventory: result?.inventory
        }
      }
    )
    return { actionId }
  }
}
