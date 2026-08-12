import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UpdateGlobalConfigAction } from '@/api/zstack/UpdateGlobalConfigAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class SetDefaultKmsProviderPayload {
  @Field(() => String)
  uuid!: string
}

@InputType()
class SetDefaultKmsProviderInput {
  @Field(() => SetDefaultKmsProviderPayload)
  payload!: SetDefaultKmsProviderPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class SetDefaultKmsProviderService extends ActionService {
  @Inject() updateGlobalConfigAction!: UpdateGlobalConfigAction

  @Mutation(() => ActionResult)
  setDefaultKmsProvider(@Args('input') input: SetDefaultKmsProviderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: SetDefaultKmsProviderPayload, taskId: string) => {
        const { uuid } = payload

        await this.updateGlobalConfigAction.call(
          {
            category: 'keyProvider',
            name: 'default.keyProviderUuid',
            value: uuid
          },
          { taskId, actionId }
        )

        return { id: payload.uuid }
      },
      { resourceUuids: [input.payload.uuid] }
    )
    return { actionId }
  }
}
