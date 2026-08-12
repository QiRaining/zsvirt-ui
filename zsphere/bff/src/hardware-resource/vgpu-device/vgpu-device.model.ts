import { Field, ObjectType, registerEnumType, InputType } from '@nestjs/graphql'

import { MdevDeviceState } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { Host } from '@/hardware-resource/host/host.model'
import { PciDevice } from '@/hardware-resource/pci-device/pci-device.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { VGpuDeviceSpec } from '@/zsphere-resource/vgpu-device-spec/vgpu-device-spec.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

export enum VGpuType {
  MdevDevice,
  PciDevice
}

registerEnumType(VGpuType, {
  name: 'VGpuType'
})
@ObjectType()
export class VGpuDevice {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  specUuid: string

  @Field(() => VGpuDeviceSpec, { nullable: true })
  specInfo?: VGpuDeviceSpec

  @Field(() => String, { nullable: true })
  address?: string

  @Field(() => Host, { nullable: true })
  host?: Host

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => PciDevice, { nullable: true })
  parent?: PciDevice

  @Field(() => String, { nullable: true })
  parentUuid?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => VGpuType, { nullable: true })
  type?: VGpuType

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance

  @Field(() => VmInstance, { nullable: true })
  templatedVmInstance?: VmInstance

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType
}

@ObjectType()
export class VGpuDeviceList extends QueryCommonResponse(VGpuDevice) {}

@InputType()
export class UpdateVGpuDeviceInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => MdevDeviceState, { nullable: true })
  state?: MdevDeviceState
}
