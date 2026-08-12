import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql'

import { GetZMigrateGatewayVmInstancesAction } from '@/api/zstack/GetZMigrateGatewayVmInstancesAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

import LongJobExtend from './long-job-extend'

@InputType()
class AddVddkPackagePayload {
  @Field(() => String)
  url: string
}

@InputType()
class AddVddkPackageInput {
  @Field(() => AddVddkPackagePayload)
  payload: AddVddkPackagePayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
class AddVddkPackageAction extends ActionResult {
  @Field({ nullable: true })
  jobResult?: string

  @Field({ nullable: true })
  transit?: string
}

export class AddVddkPackageService extends ActionService {
  @Inject() longJobExtend: LongJobExtend
  @Inject()
  getZMigrateGatewayVmInstancesAction: GetZMigrateGatewayVmInstancesAction

  @Mutation(() => AddVddkPackageAction)
  async addVddkPackage(@Args('input') input: AddVddkPackageInput) {
    const gatewayVmResult = await this.getZMigrateGatewayVmInstancesAction.call({})
    const managementVmInstanceUuid = gatewayVmResult?.managementVmInstanceUuid
    const managementVm = gatewayVmResult?.gatewayVmInstances?.find(
      vm => vm.uuid === managementVmInstanceUuid
    )

    if (!managementVmInstanceUuid || !managementVm) {
      throw new Error('ZMigrate management VM is unavailable')
    }
    if (managementVm.state !== 'Running') {
      throw new Error('ZMigrate management VM is not running')
    }

    const { action, payload } = input
    const jobData = JSON.stringify({
      type: 'ZMigrate',
      url: payload.url,
      vmInstanceUuid: managementVmInstanceUuid
    })

    return this.longJobExtend.customCall(
      action.name,
      'APIUploadSoftwarePackageToVmMsg',
      jobData,
      action.actionId,
      payload.url,
      'MigrationService',
      jobResult => {
        const uploadTaskUuid = jobResult.uploadTaskUuid
        const uploadUrl = jobResult.uploadUrl
        if (
          typeof uploadTaskUuid !== 'string' ||
          !uploadTaskUuid ||
          typeof uploadUrl !== 'string' ||
          !uploadUrl
        ) {
          return undefined
        }
        return {
          artifactUuid: uploadTaskUuid,
          uploadUrl
        }
      }
    )
  }
}
