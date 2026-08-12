import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field, Float, Int } from '@nestjs/graphql'

import { SetVmBootModeAction } from '@/api/zstack/SetVmBootModeAction'
import { UpdateVmInstanceAction, UpdateVmInstanceResult } from '@/api/zstack/UpdateVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ImageBootMode } from '@/common/enum'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { UpdateVmNetworkConfigService } from '@/zsphere-resource/vm-nic/action/sync-network-config'

import { SetVmBootModeService } from './set-vm-boot-mode'
@InputType()
export class UpdateVmInstancePayload {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  guestOsType?: string

  @Field(() => String, { nullable: true })
  bootMode?: string

  @Field(() => String, { nullable: true })
  vmNicUuid?: string

  @Field(() => String, { nullable: true })
  defaultVmNicUuid?: string

  @Field(() => Float, {
    nullable: true,
    description: '内存预留: 如果没有设置就是undefined'
  })
  reservedMemorySize?: number
}

@InputType()
export class UpdateVmInstanceInput {
  @Field(() => UpdateVmInstancePayload)
  payload: UpdateVmInstancePayload

  @Field(() => ActionInput)
  action: ActionInput
}

export class UpdateVmInstanceService extends ActionService {
  @Inject() setVmBootModeAction: SetVmBootModeAction
  @Inject() updateVmInstanceAction: UpdateVmInstanceAction
  @Inject() setVmBootModeService: SetVmBootModeService
  @Inject() updateVmNetworkConfigService: UpdateVmNetworkConfigService

  @Mutation(() => ActionResult)
  updateVmInstance(@Args('input') input: UpdateVmInstanceInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: UpdateVmInstancePayload, taskId: string) => {
        return this.updateVminstanceFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async updateVminstanceFn(
    { vmNicUuid, defaultVmNicUuid, ...payload }: UpdateVmInstancePayload,
    taskId: string,
    actionId: string
  ) {
    const result: UpdateVmInstanceResult = await this.updateVmInstanceAction.call(payload, {
      actionId,
      taskId
    })

    if (vmNicUuid && defaultVmNicUuid) {
      await this.updateVmNetworkConfigService.syncConfig(
        {
          vmInstanceUuid: payload.uuid,
          vmNicUuid,
          defaultVmNicUuid
        },
        {
          actionId,
          taskId
        }
      )
    }

    // 防止报错
    if (!result.inventory.description) {
      result.inventory.description = ''
    }
    // 切换操作系统为 非 'Windows', 'Windows 7', 'WindowsServer 2008' 时关闭 csm
    if (
      !['Windows', 'Windows 7', 'WindowsServer 2008'].includes(payload?.guestOsType) &&
      payload?.bootMode === ImageBootMode.UEFI_WITH_CSM
    ) {
      await this.setVmBootModeAction.call(
        {
          uuid: payload.uuid,
          bootMode: ImageBootMode.UEFI
        },
        {
          actionId,
          taskId
        }
      )

      const resp = await this.setVmBootModeService.queryQ35SystemTag(payload)

      if (resp?.inventories?.length === 0) {
        if (['UEFI', 'UEFI_WITH_CSM'].includes(payload.bootMode)) {
          await this.setVmBootModeService.createQ35SystemTag(payload, actionId, taskId)
        }
      } else {
        if (['UEFI', 'UEFI_WITH_CSM'].includes(payload.bootMode)) {
          await this.setVmBootModeService.updateQ35SystemTag(resp, actionId, taskId)
        } else {
          await this.setVmBootModeService.deleteQ35SystemTag(resp, actionId, taskId)
        }
      }
    }
    return {
      id: payload.uuid,
      fields:
        'name,description,state,defaultL3NetworkUuid,platform,guestOsType,cpuNum,memorySize,lastOpDate',
      inventory: result.inventory
    }
  }
}
