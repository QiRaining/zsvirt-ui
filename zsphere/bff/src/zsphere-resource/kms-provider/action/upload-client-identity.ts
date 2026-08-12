import * as fs from 'fs'
import * as path from 'path'

import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UploadKmsClientIdentityAction } from '@/api/zstack/UploadKmsClientIdentityAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { WORKING_DIR } from '@/common/paths'

@InputType()
class KmsUploadedIdentity {
  @Field(() => String)
  kmsClientCertPem!: string

  @Field(() => String)
  kmsClientKeyPem!: string
}

@InputType()
class UploadKmsClientIdentityPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => KmsUploadedIdentity, { nullable: true })
  uploadedIdentity?: KmsUploadedIdentity
}

@InputType()
class UploadKmsClientIdentityInput {
  @Field(() => UploadKmsClientIdentityPayload)
  payload!: UploadKmsClientIdentityPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class UploadKmsClientIdentityService extends ActionService {
  @Inject() uploadKmsClientIdentityAction!: UploadKmsClientIdentityAction

  @Mutation(() => ActionResult)
  uploadKmsClientIdentity(@Args('input') input: UploadKmsClientIdentityInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: UploadKmsClientIdentityPayload, taskId: string) => {
        const { uuid, uploadedIdentity } = payload
        if (uploadedIdentity) {
          await this.uploadKmsClientIdentityAction.call(
            { uuid, identityType: 'UPLOADED', ...uploadedIdentity },
            { actionId, taskId }
          )
        } else {
          const platformIdentity = await this.getPlatformIdentity()
          await this.uploadKmsClientIdentityAction.call(
            { uuid, identityType: 'PLATFORM', ...platformIdentity },
            { actionId, taskId }
          )
        }
        return { id: uuid }
      }
    )
    return { actionId }
  }

  async getPlatformIdentity() {
    const certPath = path.join(WORKING_DIR, 'ui.keystore.pem')
    const pem = fs.readFileSync(certPath, 'utf-8')
    const match = pem.match(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g)
    const [kmsClientKeyPem, kmsClientCertPem] = match!
    return { kmsClientCertPem, kmsClientKeyPem }
  }
}
