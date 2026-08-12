import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Int, Mutation, ObjectType } from '@nestjs/graphql'

import { AttachBaremetalPxeServerToClusterAction } from '@/api/zstack/AttachBaremetalPxeServerToClusterAction'
import { CreateBaremetalPxeServerAction } from '@/api/zstack/CreateBaremetalPxeServerAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@ObjectType()
class ConfigBaremetalPxeServerResult extends ActionResult {
  @Field(() => String)
  pxeServerUuid: string
}

@InputType()
class ConfigBaremetalPxeServerPayload {
  @Field(() => String)
  configType: 'manual' | 'attach'

  @Field(() => String, { nullable: true })
  pxeServerUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  dhcpInterface: string

  @Field(() => String, { nullable: true })
  storagePath: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String, { nullable: true })
  sshUsername: string

  @Field(() => String, { nullable: true })
  sshPassword: string

  @Field(() => String, { nullable: true })
  dhcpRangeBegin: string

  @Field(() => String, { nullable: true })
  dhcpRangeEnd: string

  @Field(() => [String], { nullable: true })
  clusterUuid: [string]

  @Field(() => String, { nullable: true })
  hostname: string
}

@InputType()
class ConfigBaremetalPxeServerInput {
  @Field(() => ConfigBaremetalPxeServerPayload)
  payload: ConfigBaremetalPxeServerPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateBaremetalPxeServerService extends ActionService {
  @Inject() createBaremetalPxeServerAction: CreateBaremetalPxeServerAction
  @Inject()
  attachBaremetalPxeServerToClusterAction: AttachBaremetalPxeServerToClusterAction

  @Mutation(() => ConfigBaremetalPxeServerResult)
  configBaremetalPxeServer(@Args('input') input: ConfigBaremetalPxeServerInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'BaremetalPxeServer',
      async (payload: ConfigBaremetalPxeServerPayload, taskId: string) => {
        let pxeServerUuid: string

        if (payload.configType === 'manual') {
          // 创建PXE服务器
          const result = await this.createBaremetalPxeServerAction.call(
            { ...payload },
            { actionId, taskId }
          )
          pxeServerUuid = result.inventory?.uuid
        } else {
          // 直接使用提供的PXE服务器UUID
          pxeServerUuid = payload.pxeServerUuid
        }

        // 关联到集群
        await Promise.all(
          payload.clusterUuid?.map(cv => {
            this.attachBaremetalPxeServerToClusterAction.call(
              { clusterUuid: cv, pxeServerUuid },
              { actionId, taskId }
            )
          })
        )

        return {
          id: pxeServerUuid,
          pxeServerUuid
        }
      }
    )
    return { actionId, pxeServerUuid: '' }
  }
}
