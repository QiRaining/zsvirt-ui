import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'

import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import LongJobExtend from './upload/long-job-extend'

@InputType()
class UpgradeMigrationServicePayload {
  @Field(() => String, { description: 'SoftwarePackage UUID' })
  uuid: string

  @Field(() => String, { nullable: true, description: '升级类型: Normal | Reexecute' })
  upgradeType?: string

  @Field(() => String, { nullable: true, description: '安装包名称' })
  name?: string

  @Field(() => String, { nullable: true, description: '安装包URL' })
  url?: string

  @Field(() => String, { nullable: true, description: '安装包类型' })
  type?: string

  @Field(() => String, { nullable: true, description: '安装路径' })
  installPath?: string

  @Field(() => String, { nullable: true, description: '备份存储UUID' })
  backupStorageUuid?: string

  @Field(() => String, { nullable: true, description: '文件哈希（本地上传时使用）' })
  hash?: string
}

@InputType()
class UpgradeMigrationServiceInput {
  @Field(() => UpgradeMigrationServicePayload)
  payload: UpgradeMigrationServicePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
class UpgradeMigrationServiceAction extends ActionResult {
  @Field({ nullable: true })
  jobResult: string

  @Field({ nullable: true })
  transit: string
}

export class UpgradeMigrationServiceService extends ActionService {
  @Inject() longJobExtend: LongJobExtend

  @Mutation(() => UpgradeMigrationServiceAction)
  upgradeMigrationService(@Args('input') input: UpgradeMigrationServiceInput) {
    const actionId = input.action.actionId
    const jobName = 'APIUploadAndExecuteSoftwareUpgradePackageMsg'
    const jobData = JSON.stringify(input.payload)
    const url = input.payload.url ?? ''
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
