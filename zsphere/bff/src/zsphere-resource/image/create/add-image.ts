import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { CpuArchitecture, ImageMediaType, ImagePlatform } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import LongJobExtend from './long-job-extend'

@InputType()
class AddImagePayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => CpuArchitecture, { nullable: true })
  architecture?: CpuArchitecture

  @Field(() => String, { nullable: true })
  guestOsType?: string

  @Field(() => Boolean, { nullable: true })
  virtio?: boolean

  @Field(() => String)
  url: string

  @Field(() => ImageMediaType)
  mediaType: ImageMediaType

  @Field(() => Boolean, { nullable: true })
  system?: boolean

  @Field(() => String)
  format: string

  @Field(() => ImagePlatform, { nullable: true })
  platform: ImagePlatform

  @Field(() => [String])
  backupStorageUuids: string[]

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => String, { nullable: true })
  hash?: string
}

@InputType()
class AddImageInput {
  @Field(() => AddImagePayload)
  payload: AddImagePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
class CustomAction extends ActionResult {
  @Field(() => String, { nullable: true })
  jobResult: string

  @Field(() => String, { nullable: true })
  transit: string
}

export class AddImageService extends ActionService {
  @Inject() longJobExtend: LongJobExtend

  @Mutation(() => CustomAction)
  addImage(@Args('input') input: AddImageInput) {
    const actionId = input.action.actionId
    const jobName = 'APIAddImageMsg'
    const jobData = JSON.stringify(input.payload)
    const url = input.payload.url
    const actionName = input.action.name
    const rs = this.longJobExtend.customCall(actionName, jobName, jobData, actionId, url, 'Image')
    return rs
  }
}
