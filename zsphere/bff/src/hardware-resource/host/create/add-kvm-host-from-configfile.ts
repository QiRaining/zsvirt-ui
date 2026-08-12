import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { LongJobService } from '@/common/long-job/long-job.service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class AddKVMHostFromConfigFilePayload {
  @Field(() => String)
  hostInfo: string
}

@InputType()
class AddKVMHostFromConfigFileInput {
  @Field(() => AddKVMHostFromConfigFilePayload)
  payload: AddKVMHostFromConfigFilePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class AddKVMHostFromConfigFileService extends ActionService {
  @Inject() longJobService: LongJobService

  @Mutation(() => ActionResult)
  addKVMHostFromConfigFile(@Args('input') input: AddKVMHostFromConfigFileInput) {
    const actionId = input.action.actionId
    const jobData = JSON.stringify(input.payload)
    this.longJobService.call(
      input.action.name,
      'APIAddKVMHostFromConfigFileMsg',
      jobData,
      actionId,
      'HostVO'
    )
    return { actionId }
  }
}
