import { Inject } from '@nestjs/common'
import { Args, Field, Float, InputType, Int, Mutation } from '@nestjs/graphql'

import { CreateVmInstanceFromVolumeSnapshotGroupAction } from '@/api/zstack/CreateVmInstanceFromVolumeSnapshotGroupAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'

//todo: add more fields to payload
@InputType()
class CreateVMFromZSVSnapshotPayload {
  @Field(() => String)
  volumeSnapshotGroupUuid: string

  @Field(() => String)
  name: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  l3NetworkUuids?: string[]

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuidForRootVolume?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  strategy?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  // 主板
  @Field(() => String, { nullable: true })
  motherboardType?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  rootVolumeSystemTags?: string[]

  @Field(() => String, { nullable: true })
  dataVolumeSystemTags?: string

  @Field(() => [String], { nullable: true })
  securityGroupUuids?: string[]

  @Field(() => Float, { nullable: true, description: '内存预留大小' })
  reservedMemorySize?: number

  @Field(() => String, { nullable: true })
  vmNicParams?: string

  @Field(() => Boolean, { nullable: true })
  resetTpm?: boolean
}

@InputType()
class CreateVMFromZSVSnapshotInput {
  @Field(() => CreateVMFromZSVSnapshotPayload)
  payload: CreateVMFromZSVSnapshotPayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class CreateVMFromZSVSnapshot extends ActionService {
  @Inject()
  createVmInstanceFromVolumeSnapshotAction: CreateVmInstanceFromVolumeSnapshotGroupAction

  @Mutation(() => ActionResult)
  createVMFromZSVSnapshot(@Args('input') input: CreateVMFromZSVSnapshotInput) {
    const actionId = input.action.actionId

    const actionFn = async (payload: CreateVMFromZSVSnapshotPayload, taskId: string) => {
      const {
        name,
        description,
        volumeSnapshotGroupUuid,
        l3NetworkUuids,
        defaultL3NetworkUuid,
        vmNicParams,
        hostUuid,
        zoneUuid,
        clusterUuid,
        strategy,
        cpuNum,
        memorySize,
        motherboardType,
        systemTags,
        rootVolumeSystemTags,
        resetTpm
      } = payload

      // 主板类型转换为 systemTag
      const finalSystemTags = [...(systemTags ?? [])]
      if (motherboardType === 'q35') {
        finalSystemTags.push('vmMachineType::q35')
      }

      await this.createVmInstanceFromVolumeSnapshotAction.call(
        {
          name,
          description,
          volumeSnapshotGroupUuid,
          l3NetworkUuids,
          defaultL3NetworkUuid,
          vmNicParams,
          zoneUuid,
          clusterUuid,
          strategy,
          cpuNum,
          memorySize,
          hostUuid,
          systemTags: finalSystemTags,
          rootVolumeSystemTags,
          resetTpm
        },
        {
          actionId,
          taskId
        }
      )

      return {
        id: actionId
      }
    }

    this.actionHelper(input, 'VmInstance', actionFn)
    return { actionId }
  }
}
