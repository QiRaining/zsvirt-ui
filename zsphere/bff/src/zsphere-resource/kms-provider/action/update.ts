import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation } from '@nestjs/graphql'

import { UpdateKmsAction } from '@/api/zstack/UpdateKmsAction'
import { UpdateNkpAction } from '@/api/zstack/UpdateNkpAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UpdateKmsParam {
  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  endpoint?: string

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string
}

@InputType()
class UpdateNkpParam {
  @Field(() => String, { nullable: true })
  description?: string
}

@InputType()
export class UpdateKmsProviderPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => UpdateKmsParam, { nullable: true })
  updateKmsParam?: UpdateKmsParam

  @Field(() => UpdateNkpParam, { nullable: true })
  updateNkpParam?: UpdateNkpParam
}

@InputType()
class UpdateKmsProviderInput {
  @Field(() => UpdateKmsProviderPayload)
  payload!: UpdateKmsProviderPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class UpdateKmsProviderService extends ActionService {
  @Inject() updateKmsAction!: UpdateKmsAction
  @Inject() updateNkpAction!: UpdateNkpAction

  @Mutation(() => ActionResult)
  updateKmsProvider(@Args('input') input: UpdateKmsProviderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: UpdateKmsProviderPayload, taskId: string) => {
        const { uuid, updateKmsParam, updateNkpParam } = payload
        if (updateKmsParam) {
          await this.updateKmsAction.call({ uuid, ...updateKmsParam }, { taskId, actionId })
        }
        if (updateNkpParam) {
          await this.updateNkpAction.call({ uuid, ...updateNkpParam }, { taskId, actionId })
        }
        return { id: payload.uuid }
      }
    )
    return { actionId }
  }
}
