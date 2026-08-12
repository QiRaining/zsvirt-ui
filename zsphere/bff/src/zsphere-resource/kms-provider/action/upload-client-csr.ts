import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { UploadKmsClientCsrAction } from '@/api/zstack/UploadKmsClientCsrAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { generateCsr } from '@/zsphere-administration/cert-manage/utils/openssl'

@InputType()
class KmsCsrSubject {
  @Field(() => String, { nullable: true })
  CN?: string
  @Field(() => String, { nullable: true })
  O?: string
  @Field(() => String, { nullable: true })
  OU?: string
  @Field(() => String, { nullable: true })
  C?: string
  @Field(() => String, { nullable: true })
  ST?: string
  @Field(() => String, { nullable: true })
  L?: string
  @Field(() => String, { nullable: true })
  emailAddress?: string
}

@InputType()
class UploadKmsClientCsrPayload {
  @Field(() => String)
  uuid!: string

  @Field(() => KmsCsrSubject, { nullable: true })
  kmsCsrSubject?: KmsCsrSubject
}

@InputType()
class UploadKmsClientCsrInput {
  @Field(() => UploadKmsClientCsrPayload)
  payload!: UploadKmsClientCsrPayload

  @Field(() => ActionInput)
  action!: ActionInput
}

export class UploadKmsClientCsrService extends ActionService {
  @Inject() uploadKmsClientCsrAction!: UploadKmsClientCsrAction

  @Mutation(() => ActionResult)
  uploadKmsClientCsr(@Args('input') input: UploadKmsClientCsrInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'KmsProvider',
      async (payload: UploadKmsClientCsrPayload, taskId: string) => {
        const { uuid, kmsCsrSubject } = payload
        const csrParams = await this.generateCsr(kmsCsrSubject)
        await this.uploadKmsClientCsrAction.call(
          { uuid, ...csrParams },
          {
            actionId,
            taskId
          }
        )
        return { id: uuid }
      }
    )
    return { actionId }
  }

  async generateCsr(subject?: KmsCsrSubject) {
    const tempCsrPath = fs.mkdtempSync(path.join(os.tmpdir(), 'zstack-ui-server-'))
    await generateCsr({ certPath: tempCsrPath, subject })
    const csrPem = fs.readFileSync(path.join(tempCsrPath, 'out.csr'), 'utf-8')
    const csrKeyPem = fs.readFileSync(path.join(tempCsrPath, 'out.key'), 'utf-8')
    fs.rmSync(tempCsrPath, { recursive: true, force: true })
    return { csrPem, csrKeyPem }
  }
}
