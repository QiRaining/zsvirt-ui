import { Field, ObjectType, InputType, registerEnumType, ArgsType, Int } from '@nestjs/graphql'

import { UsbDeviceState } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Host } from '@/hardware-resource/host/host.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

export enum UsbDeviceQueryType {
  'Normal' = 'Normal',
  'Cluster' = 'Cluster',
  'Host' = 'Host',
  'AttachableUsb' = 'AttachableUsb',
  'ZSVAttachableRedirectUsb' = 'ZSVAttachableRedirectUsb',
  'ZSVAttachablePassThroughUsb' = 'ZSVAttachablePassThroughUsb',
  'ZSVRedirectUsb' = 'ZSVRedirectUsb',
  'ZSVPassThroughUsb' = 'ZSVPassThroughUsb'
}
registerEnumType(UsbDeviceQueryType, {
  name: 'UsbDeviceQueryType'
})

@ArgsType()
export class QueryUsbArgs extends QueryAction {
  @Field(() => UsbDeviceQueryType, {
    nullable: true,
    defaultValue: UsbDeviceQueryType.Normal
  })
  declare type?: UsbDeviceQueryType
}
@ObjectType()
export class UsbDevice {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => Host, { nullable: true })
  host?: Host

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => VmInstance, { nullable: true })
  vmInstance: VmInstance

  @Field(() => VmInstance, { nullable: true })
  templatedVmInstance?: VmInstance

  @Field(() => String, { nullable: true })
  busNum?: string

  @Field(() => String, { nullable: true })
  devNum?: string

  @Field(() => String, { nullable: true })
  idVendor?: string

  @Field(() => String, { nullable: true })
  idProduct?: string

  @Field(() => String, { nullable: true })
  iManufacturer?: string

  @Field(() => String, { nullable: true })
  iProduct?: string

  @Field(() => String, { nullable: true })
  iSerial?: string

  @Field(() => String, { nullable: true })
  usbVersion?: string

  @Field(() => String, { nullable: true })
  attachType?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  state?: string
}

@InputType()
export class GetUsbDeviceCandidatesForAttachingVmInput {
  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  attachType?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  userTags?: string[]
}
@InputType()
export class DetachUsbDeviceFromVmInput {
  @Field(() => String)
  usbDeviceUuid: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  userTags?: string[]
}

@ObjectType()
export class UsbDeviceQueryResp {
  @Field(() => [UsbDevice], { nullable: true })
  list?: UsbDevice[]

  @Field(() => Int, { nullable: true })
  total?: number
}
@ObjectType()
export class UsbDeviceActionResp {
  @Field(() => UsbDevice, { nullable: true })
  inventory?: UsbDevice

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateUsbInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}
