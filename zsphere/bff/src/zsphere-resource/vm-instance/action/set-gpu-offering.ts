import { Inject } from '@nestjs/common'
import { Mutation, Args, InputType, Field } from '@nestjs/graphql'

import { AddMdevDeviceSpecToVmInstanceAction } from '@/api/zstack/AddMdevDeviceSpecToVmInstanceAction'
import { AddPciDeviceSpecToVmInstanceAction } from '@/api/zstack/AddPciDeviceSpecToVmInstanceAction'
import { Op, QueryParam } from '@/api/zstack/base/query-base'
import { CreateSystemTagAction } from '@/api/zstack/CreateSystemTagAction'
import { DeleteTagAction } from '@/api/zstack/DeleteTagAction'
import { QuerySystemTagAction } from '@/api/zstack/QuerySystemTagAction'
import { RemoveMdevDeviceSpecFromVmInstanceAction } from '@/api/zstack/RemoveMdevDeviceSpecFromVmInstanceAction'
import { RemovePciDeviceSpecFromVmInstanceAction } from '@/api/zstack/RemovePciDeviceSpecFromVmInstanceAction'
import { ActionService } from '@/base/action-service'
import { ActionInput, ActionResult } from '@/common/model/action.model'
import { VGpuDeviceType } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.model'
@InputType()
export class GpuDeivceSpecOnVmInstanceInput {
  @Field(() => String)
  uuid: string

  @Field(() => Boolean)
  isVirtual: boolean

  @Field(() => VGpuDeviceType)
  type: VGpuDeviceType
}

@InputType()
export class SetGpuDeviceSpecPayload {
  @Field(() => String)
  vmUuid: string

  @Field(() => GpuDeivceSpecOnVmInstanceInput, { nullable: true })
  newValue?: GpuDeivceSpecOnVmInstanceInput

  @Field(() => GpuDeivceSpecOnVmInstanceInput, { nullable: true })
  oldValue?: GpuDeivceSpecOnVmInstanceInput

  @Field(() => String)
  type: string

  @Field(() => Boolean)
  autoReleaseSpec: boolean
}

@InputType()
class SetVmInstanceGpuDeviceSpecInput {
  @Field(() => [SetGpuDeviceSpecPayload])
  payload: SetGpuDeviceSpecPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

export class SetVmInstanceGpuDeviceSpecService extends ActionService {
  @Inject()
  removePciDeviceSpecFromVmInstanceAction: RemovePciDeviceSpecFromVmInstanceAction
  @Inject()
  removeMdevDeviceSpecFromVmInstanceAction: RemoveMdevDeviceSpecFromVmInstanceAction
  @Inject()
  addPciDeviceSpecToVmInstanceAction: AddPciDeviceSpecToVmInstanceAction
  @Inject()
  addMdevDeviceSpecToVmInstanceAction: AddMdevDeviceSpecToVmInstanceAction
  @Inject()
  createSystemTagAction: CreateSystemTagAction
  @Inject()
  QuerySystemTagAction: QuerySystemTagAction
  @Inject()
  DeleteTagAction: DeleteTagAction

  @Mutation(() => ActionResult)
  setVmInstanceGpuOffering(@Args('input') input: SetVmInstanceGpuDeviceSpecInput) {
    const actionId = input.action.actionId
    this.actionHelper(
      input,
      'VmInstance',
      async (payload: SetGpuDeviceSpecPayload, taskId: string) => {
        return this.setVmInstanceGpuOfferingFn(payload, taskId, actionId)
      }
    )
    return { actionId }
  }

  async setVmInstanceGpuOfferingFn(
    payload: SetGpuDeviceSpecPayload,
    taskId: string,
    actionId: string
  ) {
    const { vmUuid, newValue, oldValue, type, autoReleaseSpec } = payload
    const serviceMap: any = {
      [VGpuDeviceType.PciDevice]: {
        remove: this.removePciDeviceSpecFromVmInstanceAction,
        add: this.addPciDeviceSpecToVmInstanceAction,
        specName: 'pciSpecUuid'
      },
      [VGpuDeviceType.MdevDevice]: {
        remove: this.removeMdevDeviceSpecFromVmInstanceAction,
        add: this.addMdevDeviceSpecToVmInstanceAction,
        specName: 'mdevSpecUuid'
      }
    }
    switch (type) {
      case 'delete':
        await serviceMap[oldValue.type].remove.call(
          {
            [serviceMap[oldValue.type].specName]: oldValue.uuid,
            vmInstanceUuid: vmUuid
          },
          { actionId, taskId }
        )
        break
      case 'change':
        await serviceMap[oldValue.type].remove.call(
          {
            [serviceMap[oldValue.type].specName]: oldValue.uuid,
            vmInstanceUuid: vmUuid
          },
          { actionId, taskId }
        )
        await serviceMap[newValue.type].add.call(
          {
            [serviceMap[newValue.type].specName]: newValue.uuid,
            vmInstanceUuid: vmUuid
          },
          { actionId, taskId }
        )
        if (autoReleaseSpec) {
          await this.createSystemTagAction.call({
            resourceUuid: vmUuid,
            resourceType: 'VmInstanceVO',
            tag: newValue.isVirtual
              ? 'autoReleaseSpecReleatedVirtualPciDevice'
              : 'autoReleaseSpecReleatedPhysicalPciDevice'
          })
        } else {
          const params: QueryParam = {
            conditions: [{ key: 'resourceUuid', op: Op.in, values: [vmUuid] }],
            start: 0,
            limit: 1000
          }
          const resp = await this.QuerySystemTagAction.call(params)
          const systemTagUuids = resp.inventories
            .map(systemTagItem => {
              if (
                [
                  'autoReleaseSpecReleatedVirtualPciDevice',
                  'autoReleaseSpecReleatedPhysicalPciDevice'
                ].includes(systemTagItem.tag)
              ) {
                return systemTagItem.uuid
              }
            })
            .filter(Boolean)
          if (systemTagUuids.length > 0) {
            Promise.all(
              systemTagUuids.map(uuid => this.DeleteTagAction.call({ uuid }, { actionId, taskId }))
            )
          }
        }
        break
      case 'add':
        await serviceMap[newValue.type].add.call(
          {
            [serviceMap[newValue.type].specName]: newValue.uuid,
            vmInstanceUuid: vmUuid
          },
          { actionId, taskId }
        )
        if (autoReleaseSpec) {
          await this.createSystemTagAction.call({
            resourceUuid: vmUuid,
            resourceType: 'VmInstanceVO',
            tag: newValue.isVirtual
              ? 'autoReleaseSpecReleatedVirtualPciDevice'
              : 'autoReleaseSpecReleatedPhysicalPciDevice'
          })
        }
        break
    }

    return {
      id: payload.vmUuid
    }
  }
}
