import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Host as IHost } from '@/hardware-resource/host/host.model'
import { MdevDeviceSpec as IMdevDeviceSpec } from '@/zsphere-resource/mdev-device-spec/mdev-device-spec.model'
import { VmInstance as IVmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'
// import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class MdevSpecRefs {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  mdevSpecUuid: string

  @Field(() => Boolean)
  effective: boolean

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class HostInGpuDevice extends PickType(IHost, ['name', 'uuid'], InputType) {}

@ObjectType()
export class VmInstanceInGpuDevice extends PickType(IVmInstance, ['name', 'uuid'], InputType) {}

@ObjectType()
export class MdevDeviceSpecInGpuDevice extends PickType(
  IMdevDeviceSpec,
  ['name', 'uuid'],
  InputType
) {}

@ObjectType()
export class MdevDevice {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  mdevSpecUuid?: string

  @Field(() => String)
  type: string

  @Field(() => String)
  state: string

  @Field(() => String)
  status: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  createDate: string

  @Field(() => MdevDeviceSpecInGpuDevice)
  mdevDeviceSpec: MdevDeviceSpecInGpuDevice
}

@InputType()
export class AttachMdevDeviceToVmInput {
  @Field(() => String)
  mdevDeviceUuid: string

  @Field(() => String)
  vmInstanceUuid: string
}

@InputType()
export class DetachMdevDeviceFromVmInput extends PickType(AttachMdevDeviceToVmInput, [
  'mdevDeviceUuid',
  'vmInstanceUuid'
]) {}

@InputType()
export class MdevDeviceActionResp {
  @Field(() => MdevDevice, { nullable: true })
  result?: MdevDevice

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class MdevDeviceQueryResp extends QueryCommonResponse(MdevDevice) {}
