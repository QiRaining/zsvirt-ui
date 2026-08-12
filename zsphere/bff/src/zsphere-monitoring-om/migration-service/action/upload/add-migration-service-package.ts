import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, ObjectType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import LongJobExtend from './long-job-extend'

@InputType()
class AddMigrationServicePackagePayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  url: string

  @Field(() => String)
  installPath: string

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  backupStorageUuid?: string

  @Field(() => String, { nullable: true })
  hash?: string
}

@InputType()
class AddMigrationServicePackageInput {
  @Field(() => AddMigrationServicePackagePayload)
  payload: AddMigrationServicePackagePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
class AddMigrationServicePackageAction extends ActionResult {
  @Field({ nullable: true })
  jobResult: string

  @Field({ nullable: true })
  transit: string
}

export class AddMigrationServicePackageService extends ActionService {
  @Inject() longJobExtend: LongJobExtend

  @Mutation(() => AddMigrationServicePackageAction)
  addMigrationServicePackage(@Args('input') input: AddMigrationServicePackageInput) {
    const actionId = input.action.actionId
    const jobName = 'APIUploadSoftwarePackageToBackupStorageMsg'
    const jobData = JSON.stringify(input.payload)
    const url = input.payload.url
    const actionName = input.action.name
    const rs = this.longJobExtend.customCall(
      actionName,
      jobName,
      jobData,
      actionId,
      url,
      'MigrationService'
    )
    return rs
  }
}
