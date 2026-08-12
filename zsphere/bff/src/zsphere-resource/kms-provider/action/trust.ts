import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UploadKmsServerCertAction } from '@/api/zstack/UploadKmsServerCertAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class TrustKmsProviderPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => String)
  serverCertPem!: string
}

@InputType()
class TrustKmsProviderInput {
  @Field(() => TrustKmsProviderPayload)
  payload!: TrustKmsProviderPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class TrustKmsProviderService extends ActionService {
  @Inject() uploadKmsServerCertAction!: UploadKmsServerCertAction

  @Mutation(() => ActionResult)
  trustKmsProvider(@Args('input') input: TrustKmsProviderInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: TrustKmsProviderPayload, taskId: string) => {
        await this.uploadKmsServerCertAction.call(payload, {
          actionId,
          taskId
        })
        return { id: payload.uuid }
      }
    )
    return { actionId }
  }
}
