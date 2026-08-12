import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { GetLatestGuestToolsForVmAction } from '@/api/zstack/GetLatestGuestToolsForVmAction'
import { GetVmGuestToolsInfoAction } from '@/api/zstack/GetVmGuestToolsInfoAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { RequestConsoleAccessAction } from '@/api/zstack/RequestConsoleAccessAction'
import { ActionService } from '@/base/action-service'
import { UIExtendedLicenseType } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'

import { VmInstanceQueryService } from '../vm-instance-query/vm-instance-query.service'
@InputType()
class OpenConsolePayload {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true, description: '社区版本能打开vnc' })
  licenseType?: string

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  getToolsInfo?: boolean
}

@InputType()
class OpenConsoleInput {
  @Field(() => [OpenConsolePayload])
  payload: OpenConsolePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class OpenConsoleService extends ActionService {
  @Inject() requestConsoleAccessAction: RequestConsoleAccessAction
  @Inject() getVmGuestToolsInfoAction: GetVmGuestToolsInfoAction
  @Inject() getLatestGuestToolsForVm: GetLatestGuestToolsForVmAction
  @Inject() apiQuerySystemTagAction: QuerySystemTagAction
  @Inject() vmInstanceQueryService: VmInstanceQueryService
  @Inject() managementNodeService: ManagementNodeService

  @Mutation(() => ActionResult)
  openConsoleAccess(@Args('input') input: OpenConsoleInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'VmInstance', async (payload: OpenConsolePayload, taskId: string) => {
      const {
        getToolsInfo,
        vmInstanceUuid,
        type,
        hypervisorType,
        hostUuid,
        platform,
        licenseType
      } = payload
      const result = await this.requestConsoleAccessAction.call(
        { vmInstanceUuid },
        { actionId, taskId }
      )
      let vmToolsInfoResult: any = {}
      //licenseType !== 'Community' ,
      try {
        if (
          getToolsInfo &&
          type === 'UserVm' &&
          hypervisorType !== 'ESX' &&
          licenseType !== UIExtendedLicenseType.Community
        ) {
          vmToolsInfoResult = await this.getVmGuestToolsInfoAction.call(
            {
              uuid: vmInstanceUuid
            },
            { actionId, taskId }
          )

          vmToolsInfoResult.toolsState = await this.vmInstanceQueryService.getGuestToolsState(
            vmInstanceUuid,
            platform,
            hostUuid
          )
          vmToolsInfoResult.lowVersion =
            await this.vmInstanceQueryService.isToolsLowVersion(vmInstanceUuid)
        }
      } catch (error) {}
      //
      // VPC路由器打开控制台也是调用这个接口，添加逻辑需要考虑是否云主机/路由器独有。
      //

      return {
        id: payload.vmInstanceUuid,
        inventory: {
          ...result.inventory,
          toolsInfo: vmToolsInfoResult
        }
      }
    })
    return { actionId }
  }
}
