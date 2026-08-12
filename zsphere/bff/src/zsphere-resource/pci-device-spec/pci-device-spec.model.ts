import { Field, ObjectType, InputType, registerEnumType, Int } from '@nestjs/graphql'

import { PciDeviceSpecState } from '@/common/enum/zstack'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionInput } from '@/common/model/action.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

@ObjectType()
export class PciDeviceSpec {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  vendorId?: string

  @Field(() => String, { nullable: true })
  deviceId?: string

  @Field(() => String, { nullable: true })
  subvendorId?: string

  @Field(() => String, { nullable: true })
  subdeviceId?: string

  @Field(() => String, { nullable: true })
  romContent?: string

  @Field(() => String, { nullable: true })
  romVersion?: string

  @Field(() => String, { nullable: true })
  romMd5sum?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => PciDeviceSpecState, { nullable: true })
  state?: PciDeviceSpecState

  @Field(() => Boolean, { nullable: true })
  isVirtual?: boolean

  @Field(() => Int, { nullable: true })
  maxPartNum?: number

  @Field(() => Boolean, { nullable: true })
  ramSize?: boolean

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType
}

@InputType()
export class UpdatePciDeviceSpecPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class UpdatePciDeviceSpecInput {
  @Field(() => [UpdatePciDeviceSpecPayload])
  payload: UpdatePciDeviceSpecPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
export class PciDeviceSpecList extends QueryCommonResponse(PciDeviceSpec) {}
