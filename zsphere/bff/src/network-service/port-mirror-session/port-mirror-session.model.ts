import { Int, Field, ObjectType, registerEnumType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
import { VmNic } from '@/zsphere-resource/vm-nic/vm-nic.model'

export enum PortMirrorSessionStatus {
  Created = 'Created',
  Active = 'Active',
  Inactive = 'Inactive'
}
registerEnumType(PortMirrorSessionStatus, {
  name: 'PortMirrorSessionStatus'
})

export enum PortMirrorSessionType {
  Ingress = 'Ingress',
  Egress = 'Egress',
  Bidirection = 'Bidirection'
}
registerEnumType(PortMirrorSessionType, {
  name: 'PortMirrorSessionType'
})

@ObjectType()
export class PortMirrorSession {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  internalId: string

  @Field(() => String, { nullable: true })
  srcEndPoint: string

  @Field(() => VmNic, { nullable: true })
  srcVmNic: VmNic

  @Field(() => String, { nullable: true })
  dstEndPoint: string

  @Field(() => VmNic, { nullable: true })
  dstVmNic: VmNic

  @Field(() => String, { nullable: true })
  portMirrorUuid: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => PortMirrorSessionStatus, { nullable: true })
  status: PortMirrorSessionStatus

  @Field(() => PortMirrorSessionType, { nullable: true })
  type: PortMirrorSessionType
}

@ObjectType()
export class PortMirrorSessionList {
  @Field(() => [PortMirrorSession])
  list: PortMirrorSession[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class PortMirrorSessionActionResp {
  @Field(() => PortMirrorSession, { nullable: true })
  result?: PortMirrorSession

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
