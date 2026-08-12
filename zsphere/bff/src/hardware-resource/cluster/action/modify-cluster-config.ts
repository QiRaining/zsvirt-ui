import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'
import * as _ from 'lodash'

import { ZQLService } from '@/api/zstack/base/zql-query'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteResourceConfigAction } from '@/api/zstack/DeleteResourceConfigAction'
import { UpdateClusterAction } from '@/api/zstack/UpdateClusterAction'
import { UpdateResourceConfigAction } from '@/api/zstack/UpdateResourceConfigAction'
import { UpdateSystemTagAction } from '@/api/zstack/UpdateSystemTagAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import ZQL, { ZOp } from '@/common/zql/index'

import { ClusterResourceConfig, CreateClusterService } from './create'

@InputType()
class ModifyClusterConfigPayload {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  displayNetworkCidr?: string

  @Field(() => String, { nullable: true })
  migrateNetworkCidr?: string

  @Field(() => String)
  clusterUuid: string

  @Field(() => String, { nullable: true })
  checkCpuModel?: string

  @Field(() => String, { nullable: true })
  cpuMode?: string

  @Field(() => [ClusterResourceConfig], {
    nullable: true,
    defaultValue: []
  })
  resourceConfigList?: ClusterResourceConfig[]
}

@InputType()
class ModifyClusterConfigInput {
  @Field(() => ModifyClusterConfigPayload)
  payload: ModifyClusterConfigPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class ModifyClusterConfigService extends ActionService {
  @Inject() private zqlService: ZQLService
  @Inject() private updateClusterAction: UpdateClusterAction
  @Inject() private createClusterService: CreateClusterService
  @Inject() private createSystemTagAction: CreateSystemTagAction
  @Inject() private updateSystemTagAction: UpdateSystemTagAction
  @Inject() private updateResourceConfigAction: UpdateResourceConfigAction
  @Inject() private deleteResourceConfigAction: DeleteResourceConfigAction

  @Mutation(() => ActionResult)
  modifyClusterConfig(@Args('input') input: ModifyClusterConfigInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'Cluster',
      async (payload: ModifyClusterConfigPayload, taskId: string) => {
        const { ...params } = payload
        const { clusterUuid, systemTags, name, description } = this.buildCreateInput(params)
        const action = { actionId, taskId }

        if (name || description) {
          await this.updateClusterAction.call(
            {
              uuid: clusterUuid,
              name,
              description
            },
            action
          )
        }

        if (systemTags.length > 0) {
          await this.updateClusterSystemTag(systemTags, clusterUuid, action)
        }

        if (payload?.cpuMode === 'useGlobalConfig') {
          try {
            await this.deleteResourceConfigAction.call(
              {
                name: 'vm.cpuMode',
                category: 'kvm',
                resourceUuid: clusterUuid
              },
              action
            )
          } catch (e) {}
        }

        const resourceConfigList = _.cloneDeep(params.resourceConfigList) || []

        if (payload?.cpuMode && payload?.cpuMode !== 'useGlobalConfig') {
          resourceConfigList.push({
            name: 'vm.cpuMode',
            category: 'kvm',
            value: payload.cpuMode
          })
          // try {
          //   await this.updateResourceConfigAction.call(
          //     {
          //       name: 'vm.cpuMode',
          //       category: 'kvm',
          //       value: payload.cpuMode,
          //       resourceUuid: clusterUuid
          //     },
          //     action
          //   )
          // } catch (error) {
          //   console.error(error)
          // }
        }

        if (resourceConfigList?.length > 0) {
          await this.createClusterService.updateResourceConfig(
            resourceConfigList,
            clusterUuid,
            action
          )
        }

        return {
          id: clusterUuid
        }
      }
    )
    return { actionId }
  }

  private buildCreateInput(payload: ModifyClusterConfigPayload) {
    const obj = {
      clusterUuid: payload.clusterUuid,
      name: payload.name,
      description: payload.description,
      systemTags: []
    }

    if (payload.displayNetworkCidr && !_.isEmpty(payload.displayNetworkCidr)) {
      obj.systemTags.push(`display::network::cidr::${payload.displayNetworkCidr}`)
    }
    // if (payload.displayNetworkCidr && _.isEmpty(payload.displayNetworkCidr)) {
    //   obj.systemTags.push(`display::network::cidr::${'delete'}`)
    // }

    if (payload.migrateNetworkCidr && !_.isEmpty(payload.migrateNetworkCidr)) {
      obj.systemTags.push(`cluster::migrate::network::cidr::${payload.migrateNetworkCidr}`)
    }
    // if (payload.migrateNetworkCidr && _.isEmpty(payload.migrateNetworkCidr)) {
    //   obj.systemTags.push(`cluster::migrate::network::cidr::${'delete'}`)
    // }

    if (payload.checkCpuModel && payload.checkCpuModel !== 'default') {
      obj.systemTags.push(`check::cluster::cpu::model::${payload.checkCpuModel}`)
    }
    return obj
  }

  private updateClusterSystemTag = async (
    systemTags: string[],
    clusterUuid,
    action: {
      actionId: string
      taskId: string
    }
  ) => {
    for (const tag of systemTags) {
      const splitTag = tag.split('::')

      const tagValue = splitTag.pop()
      const tagPrefix = splitTag.join('::')

      // if (tagValue === 'delete') continue // 是否删除，暂无删除api, update 暂时也不支持传空

      const zqlObject = {
        tableName: 'SystemTag',
        fields: ['uuid', 'tag'],
        condition: {
          resourceUuid: clusterUuid,
          resourceType: 'ClusterVO',
          tag: {
            [ZOp.like]: tagPrefix
          }
        }
      }

      const zql = ZQL.stringify(zqlObject)
      let tagUuid

      try {
        const respTag = await this.zqlService.call(zql)
        tagUuid = _.get(respTag, ['results', '0', 'inventories', '0', 'uuid'], undefined)
      } catch (error) {}

      if (tagUuid) {
        await this.updateSystemTagAction.call(
          {
            uuid: tagUuid,
            tag: tagValue !== 'delete' ? `${tagPrefix}::${tagValue}` : ''
          },
          action
        )
      } else {
        if (tagValue !== 'delete') {
          await this.createSystemTagAction.call(
            {
              resourceType: 'ClusterVO',
              resourceUuid: clusterUuid,
              tag: `${tagPrefix}::${tagValue}`
            },
            action
          )
        }
      }
    }
  }
}
