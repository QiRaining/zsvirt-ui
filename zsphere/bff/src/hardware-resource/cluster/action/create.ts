import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation, ObjectType, OmitType } from '@nestjs/graphql'
import * as _ from 'lodash'

import { AttachBareMetal2ProvisionNetworkToClusterAction } from '@/api/zstack/AttachBareMetal2ProvisionNetworkToClusterAction'
import { AttachIscsiServerToClusterAction } from '@/api/zstack/AttachIscsiServerToClusterAction'
import { AttachL2NetworkToClusterAction } from '@/api/zstack/AttachL2NetworkToClusterAction'
import { AttachPrimaryStorageToClusterAction } from '@/api/zstack/AttachPrimaryStorageToClusterAction'
import { CreateClusterAction, CreateClusterResult } from '@/api/zstack/CreateClusterAction'
import { CreateClusterDRSAction } from '@/api/zstack/CreateClusterDRSAction'
import { UpdateGlobalConfigAction } from '@/api/zstack/UpdateGlobalConfigAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { UpdateResourceConfigsAction } from '@/api/zstack/UpdateResourceConfigsAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UpdateGlobalConfigPayload as ClusterGlobalConfig } from '@/settings/global-config/action/update-global-config'
import { UpdateResourceConfigPayload } from '@/settings/resource-config/action/update-resource-config'
import { IResourceConfigs } from '@/settings/resource-config/action/update-resource-configs'

import { CreateClusterDRSPayload } from './create-cluster-drs'

@ObjectType()
@InputType()
export class ClusterResourceConfig extends OmitType(UpdateResourceConfigPayload, [
  'resourceUuid',
  'uuid'
]) {}

@ObjectType()
@InputType()
export class DrsConfig extends OmitType(CreateClusterDRSPayload, ['clusterUuid']) {}

@InputType()
class CreateClusterPayload {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  displayNetworkCidr?: string

  @Field(() => String, { nullable: true })
  migrateNetworkCidr?: string

  @Field(() => String)
  hypervisorType: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String, { nullable: true })
  checkCpuModel?: string

  @Field(() => String, { nullable: true })
  cpuMode?: string

  @Field(() => String, { nullable: true, description: 'CPU架构' })
  architecture?: string

  @Field(() => String, {
    nullable: true,
    description: '创建弹性裸金属集群需要的部署网络'
  })
  provisionNetworkUuid?: string

  @Field(() => String, {
    nullable: true,
    description: '创建弹性裸金属集群需要挂载的主存储'
  })
  primaryStorageUuid?: string

  @Field(() => String, {
    nullable: true,
    description: '创建弹性裸金属集群需要挂载的二层网络'
  })
  l2NetworkUuid?: string

  @Field(() => String, {
    nullable: true,
    description: '创建弹性裸金属集群需要挂载的IscsiServer'
  })
  iscsiServerUuid?: string

  @Field(() => Boolean, {
    nullable: true,
    description: '网络加速'
  })
  networkHp?: boolean

  @Field(() => [ClusterResourceConfig], {
    nullable: true,
    defaultValue: []
  })
  resourceConfigList?: ClusterResourceConfig[]

  @Field(() => [ClusterGlobalConfig], {
    nullable: true,
    defaultValue: []
  })
  globalConfigList?: ClusterGlobalConfig[]

  @Field(() => String, { nullable: true })
  automationLevel?: string

  @Field(() => DrsConfig, { nullable: true })
  drsConfig?: DrsConfig
}

@InputType()
class CreateClusterInput {
  @Field(() => CreateClusterPayload)
  payload: CreateClusterPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateClusterService extends ActionService {
  @Inject() createClusterAction: CreateClusterAction
  @Inject()
  attachBareMetal2ProvisionNetworkToClusterAction: AttachBareMetal2ProvisionNetworkToClusterAction
  @Inject()
  attachL2NetworkToClusterAction: AttachL2NetworkToClusterAction
  @Inject()
  attachPrimaryStorageToClusterAction: AttachPrimaryStorageToClusterAction
  @Inject()
  attachIscsiServerToClusterAction: AttachIscsiServerToClusterAction
  @Inject() updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() updateResourceConfigsAction: UpdateResourceConfigsAction
  @Inject() updateGlobalConfigAction: UpdateGlobalConfigAction
  @Inject() createClusterDRSAction: CreateClusterDRSAction

  @Mutation(() => ActionResult)
  createCluster(@Args('input') input: CreateClusterInput) {
    const actionId = input.action.actionId
    this.actionHelper(input, 'Cluster', async (payload: CreateClusterPayload, taskId: string) => {
      const {
        provisionNetworkUuid = '',
        primaryStorageUuid = '',
        l2NetworkUuid = '',
        iscsiServerUuid = '',
        networkHp,
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

      // 加载部署网络
      if (!!provisionNetworkUuid) {
        try {
          await this.attachBareMetal2ProvisionNetworkToClusterAction.call(
            {
              clusterUuid: result.inventory.uuid,
              networkUuid: provisionNetworkUuid
            },
            action
          )
        } catch (error) {
          console.error(error)
        }
      }

      // 加载主存储
      if (!!primaryStorageUuid) {
        try {
          await this.attachPrimaryStorageToClusterAction.call(
            {
              clusterUuid: result.inventory.uuid,
              primaryStorageUuid
            },
            action
          )
        } catch (error) {
          console.error(error)
        }
      }

      // 加载二层网络
      if (!!l2NetworkUuid) {
        try {
          await this.attachL2NetworkToClusterAction.call(
            {
              clusterUuid: result.inventory.uuid,
              l2NetworkUuid
            },
            action
          )
        } catch (error) {
          console.error(error)
        }
      }

      // 加载iscisiServer
      if (!!iscsiServerUuid) {
        try {
          await this.attachIscsiServerToClusterAction.call(
            {
              clusterUuid: result.inventory.uuid,
              uuid: iscsiServerUuid
            },
            action
          )
        } catch (error) {
          console.error(error)
        }
      }

      const resourceConfigs: IResourceConfigs[] = []
      if (networkHp) {
        resourceConfigs.push({
          name: 'network.ovsdpdk',
          category: 'premiumCluster',
          value: 'true'
        })
      }

      if (payload?.cpuMode && payload?.cpuMode !== 'useGlobalConfig') {
        resourceConfigs.push({
          name: 'vm.cpuMode',
          category: 'kvm',
          value: payload.cpuMode
        })
      }

      if (resourceConfigs?.length > 0) {
        try {
          await this.updateResourceConfigsAction.call(
            {
              resourceConfigs,
              resourceUuid: result.inventory.uuid
            },
            action
          )
        } catch (error) {
          throw error
        }
      }

      if (
        ['Manual', 'Automatic'].includes(params?.automationLevel) &&
        params.hypervisorType === 'KVM'
      ) {
        await this.createClusterDRSAction.call(
          {
            ...params?.drsConfig,
            name: `DRS-${result.inventory.uuid}`,
            clusterUuid: result.inventory.uuid
          },
          action
        )
      }

      if (params.globalConfigList.length > 0) {
        await this.updateGlobalConfig(params.globalConfigList, action)
      }

      return {
        id: result.inventory.uuid,
        fields: `name`,
        inventory: result.inventory
      }
    })
    return { actionId }
  }

  buildCreateInput(payload: CreateClusterPayload) {
    const obj = {
      name: payload.name,
      description: payload.description,
      zoneUuid: payload.zoneUuid,
      type: payload.type,
      hypervisorType: payload.hypervisorType,
      architecture: payload.architecture,
      systemTags: []
    }
    if (payload.displayNetworkCidr) {
      obj.systemTags.push(`display::network::cidr::${payload.displayNetworkCidr}`)
    }
    if (payload.migrateNetworkCidr) {
      obj.systemTags.push(`cluster::migrate::network::cidr::${payload.migrateNetworkCidr}`)
    }
    if (payload?.checkCpuModel && payload.checkCpuModel !== 'default') {
      obj.systemTags.push(`check::cluster::cpu::model::${payload.checkCpuModel}`)
    }

    if (payload?.resourceConfigList?.length > 0) {
      _.forEach(payload?.resourceConfigList || [], it => {
        obj.systemTags.push(`resourceConfig::${it?.category}::${it?.name}::${it?.value}`)
      })
    }
    return obj
  }

  updateResourceConfig = async (
    resourceConfigList: ClusterResourceConfig[],
    clusterUuid: string,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    await this.updateResourceConfigsAction.call(
      {
        resourceConfigs: resourceConfigList,
        resourceUuid: clusterUuid
      },
      action
    )

    // await Promise.all(
    //   resourceConfigList.map(config =>
    //     this.updateResourceConfigAction.call(
    //       {
    //         ...config,
    //         resourceUuid: clusterUuid
    //       },
    //       action
    //     )
    //   )
    // )
  }

  updateGlobalConfig = async (
    globalConfigList,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    await Promise.allSettled(
      globalConfigList.map(it => this.updateGlobalConfigAction.call(it, action))
    )
  }
}
