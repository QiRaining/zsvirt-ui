import { Field, ObjectType, InputType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionInput } from '@/common/model/action.model'
import { PciDeviceSpec } from '@/zsphere-resource/pci-device-spec/pci-device-spec.model'

export enum VGpuDeviceType {
  PciDevice,
  MdevDevice
}

registerEnumType(VGpuDeviceType, {
  name: 'VGpuDeviceType'
})
@ObjectType()
export class VGpuDeviceSpec extends PciDeviceSpec {
  @Field(() => String, { nullable: true })
  fbMemory?: string

  @Field(() => String, { nullable: true })
  maxInstance?: string

  @Field(() => String, { nullable: true })
  frameRateLimit?: string

  @Field(() => String, { nullable: true })
  manufacturer?: string

  @Field(() => String, { nullable: true })
  maximumResolution?: string

  @Field(() => String, { nullable: true })
  subSystemId?: string

  @Field(() => String, { nullable: true })
  gridLicense?: string

  @Field(() => VGpuDeviceType)
  deviceType: VGpuDeviceType
}

@InputType()
export class UpdateVGpuDeviceSpecPayload {
  @Field(() => String)
  uuid: string

  @Field(() => VGpuDeviceType)
  deviceType: VGpuDeviceType
}

@InputType()
export class UpdateVGpuDeviceSpecInput {
  @Field(() => [UpdateVGpuDeviceSpecPayload])
  payload: UpdateVGpuDeviceSpecPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
export class VGpuDeviceSpecList extends QueryCommonResponse(VGpuDeviceSpec) {}
