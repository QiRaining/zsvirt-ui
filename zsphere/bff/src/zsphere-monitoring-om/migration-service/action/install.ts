import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { InstallSoftwarePackageAction } from '@/api/zstack/InstallSoftwarePackageAction'
import { UninstallSoftwarePackageAction } from '@/api/zstack/UninstallSoftwarePackageAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { NginxService } from '@/common/nginx'
import { ManagementNodeService } from '@/zsphere-administration/management-node/management-node.service'

@InputType()
class InstallMigrationServicePayload {
  @Field(() => String, { description: '安装包UUID' })
  uuid: string

  @Field(() => Boolean, {
    nullable: true,
    description: '重新安装时是否需要清理'
  })
  needClear?: boolean

  @Field(() => String, { nullable: true, description: '配置JSON字符串' })
  config?: string
}

@InputType()
class InstallMigrationServiceInput {
  @Field(() => [InstallMigrationServicePayload])
  payload: InstallMigrationServicePayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class InstallMigrationServiceService extends ActionService {
  @Inject() installSoftwarePackageAction: InstallSoftwarePackageAction
  @Inject() uninstallSoftwarePackageAction: UninstallSoftwarePackageAction
  @Inject() private nginxService: NginxService
  @Inject() private managementNodeService: ManagementNodeService

  @Mutation(() => ActionResult)
  installMigrationService(@Args('input') input: InstallMigrationServiceInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'MigrationService',
      async (payload: InstallMigrationServicePayload, taskId: string) => {
        if (payload?.needClear) {
          await this.uninstallSoftwarePackageAction.call(
            {
              uuid: payload.uuid
            },
            {
              actionId,
              taskId
            }
          )
        }

        await this.installSoftwarePackageAction.call(payload, {
          actionId,
          taskId
        })

        // 配置zmigrate的nginx代理
        // zmigrate自身nginx监听15300端口，zsv通过此端口代理到zmigrate服务
        const { ip: managementIp } = await this.managementNodeService.getManagementNodeIp()
        await this.nginxService.setupProxy({
          serviceId: 'zmigrate',
          managementIp,
          port: 15300
        })

        return {
          id: actionId
        }
      }
    )
    return { actionId }
  }
}
