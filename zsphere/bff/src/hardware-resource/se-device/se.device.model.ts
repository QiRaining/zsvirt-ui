import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'

import { UsbDeviceState } from '@/common/enum'
import { ActionError } from '@/common/model/action-resp.model'
import { Host } from '@/hardware-resource/host/host.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

@ObjectType()
export class SeDevice {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  hostUuid: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => Host, { nullable: true })
  host?: Host

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  status: string

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ObjectType()
export class SeDeviceQueryResp {
  @Field(() => [SeDevice], { nullable: true })
  list?: SeDevice[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class SeDeviceActionResp {
  @Field(() => SeDevice, { nullable: true })
  inventory?: SeDevice

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class DeleteSeInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}

@InputType()
export class CreateSeInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}

@InputType()
export class AttachSeInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}

@InputType()
export class DetachSeInput {
  @Field(() => [String])
  uuids: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => UsbDeviceState, { nullable: true })
  state?: UsbDeviceState
}
