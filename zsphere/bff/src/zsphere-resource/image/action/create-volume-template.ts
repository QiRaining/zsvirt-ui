import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ActionService } from '@/base/action-service'
import { ImagePlatform } from '@/common/enum'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class CreateVolumeTemplateInputParam {
  @Field(() => String, { nullable: true })
  vmUuid?: string

  @Field(() => String)
  volumeUuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { defaultValue: false })
  isSystem: boolean

  @Field(() => [String])
  backupStorageUuids: string[]

  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  @Field(() => String, { nullable: true })
  guestOsType?: string
}

@InputType()
class CreateVolumeTemplateInput {
  @Field(() => CreateVolumeTemplateInputParam)
  payload: CreateVolumeTemplateInputParam

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVolumeTemplateService extends ActionService {
  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  createVolumeTemplate(@Args('input') input: CreateVolumeTemplateInput) {
    let jobName: string
    const cloneInput: any = _.cloneDeep(input)
    const actionId = input.action.actionId
    cloneInput.payload.format = 'qcow2'
    if (input.payload.isSystem) {
      cloneInput.payload.rootVolumeUuid = input.payload.volumeUuid
      cloneInput.payload.mediaType = 'RootVolumeTemplate'
      jobName = 'APICreateRootVolumeTemplateFromRootVolumeMsg'
    } else {
      cloneInput.payload.mediaType = 'DataVolumeTemplate'
      jobName = 'APICreateDataVolumeTemplateFromVolumeMsg'
    }

    const jobData = JSON.stringify(cloneInput.payload)
    this.longJobService.call(input.action.name, jobName, jobData, actionId, 'Image')
    return { actionId }
  }
}
