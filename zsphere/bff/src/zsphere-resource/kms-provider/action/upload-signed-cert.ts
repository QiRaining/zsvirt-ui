import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UploadKmsClientSignedCertAction } from '@/api/zstack/UploadKmsClientSignedCertAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class UploadKmsClientSignedCertPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => String)
  signedClientCertPem!: string
}

@InputType()
class UploadKmsClientSignedCertInput {
  @Field(() => UploadKmsClientSignedCertPayload)
  payload!: UploadKmsClientSignedCertPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class UploadKmsClientSignedCertService extends ActionService {
  @Inject() uploadKmsClientSignedCertAction!: UploadKmsClientSignedCertAction

  @Mutation(() => ActionResult)
  uploadKmsClientSignedCert(@Args('input') input: UploadKmsClientSignedCertInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: UploadKmsClientSignedCertPayload, taskId: string) => {
        await this.uploadKmsClientSignedCertAction.call(payload, {
          actionId,
          taskId
        })
        return { id: payload.uuid }
      }
    )
    return { actionId }
  }
}
