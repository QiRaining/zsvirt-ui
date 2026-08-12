import { Inject } from '@nestjs/common'
import { Args, Field, InputType, Mutation } from '@nestjs/graphql'

import { RegisterVmInstanceFromMetadataAction } from '@/api/zstack/RegisterVmInstanceFromMetadataAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

@InputType()
class RegisterVmInstancePayload {
  @Field(() => String, {
    description: '元数据路径'
  })
  metadataPath: string

  @Field(() => String, {
    description: '主存储 UUID'
  })
  primaryStorageUuid: string

  @Field(() => String, {
    description: '虚拟机名称'
  })
  name: string

  @Field(() => String, {
    nullable: true,
    description: '分组'
  })
  group?: string

  @Field(() => String, {
    description: '区域 UUID'
  })
  zoneUuid: string

  @Field(() => String, {
    description: '集群 UUID'
  })
  clusterUuid: string

  @Field(() => String, {
    nullable: true,
    description: '主机 UUID'
  })
  hostUuid?: string

  @Field(() => Boolean, {
    description: '是否强制忽略版本不匹配'
  })
  forceVersionMismatch: boolean
}

@InputType()
class RegisterVmInstanceInput {
  @Field(() => RegisterVmInstancePayload)
  payload: RegisterVmInstancePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class RegisterVmInstanceService extends ActionService {
  @Inject()
  registerVmInstanceFromMetadataAction: RegisterVmInstanceFromMetadataAction

  @Mutation(() => ActionResult)
  registerVmInstance(@Args('input') input: RegisterVmInstanceInput) {
    const actionId = input.action.actionId

    this.actionHelper(
      input,
      'VmInstance',
      async (payload: RegisterVmInstancePayload, taskId: string) => {
        const { group, ...params } = payload
        const systemTags: string[] = []
        if (group && group !== '-2' && group !== '-1') {
          systemTags.push(`directoryUuid::${group}`)
        }

        const result = await this.registerVmInstanceFromMetadataAction.call(
          { ...params, systemTags },
          { actionId, taskId }
        )
        return {
          id: taskId,
          inventory: result?.inventory
        }
      },
      {
        listenerType: 'registerVmInstance'
      }
    )

    return { actionId }
  }
}
