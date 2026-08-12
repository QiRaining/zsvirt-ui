import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { AttachBaremetalPxeServerToClusterAction } from '@/api/zstack/AttachBaremetalPxeServerToClusterAction'
import { CreateBaremetalPxeServerAction } from '@/api/zstack/CreateBaremetalPxeServerAction'
import { CreateClusterAction, CreateClusterResult } from '@/api/zstack/CreateClusterAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
export class CreateBaremetalClusterPayload {
  @Field(() => String)
  name: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String, {
    nullable: true,
    description: '配置类型'
  })
  configType: 'manual' | 'attach'

  @Field(() => String, {
    nullable: true,
    description: '简介'
  })
  description?: string

  @Field(() => Boolean, {
    nullable: true,
    description: '是否需要创建PXE服务器'
  })
  needCreatePxeServer?: boolean

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器名称'
  })
  pxeServerName?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器描述'
  })
  pxeServerDescription?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器DHCP接口'
  })
  pxeServerDhcpInterface?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器存储路径'
  })
  pxeServerStoragePath?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器SSH端口'
  })
  pxeServerSshPort?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器SSH用户名'
  })
  pxeServerSshUsername?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器SSH密码'
  })
  pxeServerSshPassword?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器DHCP范围起始'
  })
  pxeServerDhcpRangeBegin?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器DHCP范围结束'
  })
  pxeServerDhcpRangeEnd?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器主机名'
  })
  pxeServerHostname?: string

  @Field(() => String, {
    nullable: true,
    description: 'PXE服务器UUID,直接attach的时候用的'
  })
  pxeServerUuid?: string
}

@InputType()
export class CreateBaremetalClusterInput {
  @Field(() => CreateBaremetalClusterPayload)
  payload: CreateBaremetalClusterPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateClusterService extends ActionService {
  @Inject() createClusterAction: CreateClusterAction
  @Inject() createBaremetalPxeServerAction: CreateBaremetalPxeServerAction
  @Inject()
  attachBaremetalPxeServerToClusterAction: AttachBaremetalPxeServerToClusterAction

  @Mutation(() => ActionResult)
  createBaremetalCluster(@Args('input') input: CreateBaremetalClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Cluster',
      async (payload: CreateBaremetalClusterPayload, taskId: string) => {
        const {
          needCreatePxeServer,
          pxeServerName,
          pxeServerDescription,
          pxeServerDhcpInterface,
          pxeServerStoragePath,
          pxeServerSshPort,
          pxeServerSshUsername,
          pxeServerSshPassword,
          pxeServerDhcpRangeBegin,
          pxeServerDhcpRangeEnd,
          pxeServerHostname,
          pxeServerUuid,
          ...params
        } = payload
        const param = this.buildCreateInput(params)
        const action = { actionId, taskId }

        const result: CreateClusterResult = await this.createClusterAction.call(
          {
            ...param
          },
          action
        )

        // 如果需要创建PXE服务器
        if (params.configType) {
          try {
            let pxeUuid: string

            if (params.configType === 'manual') {
              // 创建PXE服务器
              const pxeResult = await this.createBaremetalPxeServerAction.call(
                {
                  zoneUuid: payload.zoneUuid,
                  name: pxeServerName,
                  description: pxeServerDescription,
                  dhcpInterface: pxeServerDhcpInterface,
                  storagePath: pxeServerStoragePath,
                  sshPort: Number(pxeServerSshPort),
                  sshUsername: pxeServerSshUsername,
                  sshPassword: pxeServerSshPassword,
                  dhcpRangeBegin: pxeServerDhcpRangeBegin,
                  dhcpRangeEnd: pxeServerDhcpRangeEnd,
                  hostname: pxeServerHostname
                },
                action
              )
              pxeUuid = pxeResult.inventory?.uuid
            } else {
              // 直接使用提供的PXE服务器UUID
              pxeUuid = payload.pxeServerUuid
            }

            // 关联到集群
            await this.attachBaremetalPxeServerToClusterAction.call(
              {
                clusterUuid: result.inventory.uuid,
                pxeServerUuid: pxeUuid || ''
              },
              action
            )
          } catch (error) {
            console.error('Failed to create or attach PXE server:', error)
          }
        }

        return {
          id: result.inventory.uuid,
          fields: `name`,
          inventory: result.inventory
        }
      }
    )
    return { actionId }
  }

  buildCreateInput(payload: CreateBaremetalClusterPayload) {
    return {
      name: payload.name,
      zoneUuid: payload.zoneUuid,
      hypervisorType: 'baremetal',
      type: 'baremetal',
      systemTags: []
    }
  }
}
