import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { PortMirrorSession } from '@/network-service/port-mirror-session/port-mirror-session.model'

export enum PortMirrorStateEvent {
  enable = 'enable',
  disable = 'disable'
}
registerEnumType(PortMirrorStateEvent, {
  name: 'PortMirrorStateEvent'
})

export enum PortMirrorState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}
registerEnumType(PortMirrorState, {
  name: 'PortMirrorState'
})

@ObjectType()
export class PortMirror {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  mirrorNetworkUuid?: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => PortMirrorState, { nullable: true })
  state: PortMirrorState

  @Field(() => [PortMirrorSession], { nullable: true })
  sessions: Array<PortMirrorSession>

  @Field(() => L3Network)
  flowNetwork: L3Network
}

@ObjectType()
export class PortMirrorList {
  @Field(() => [PortMirror])
  list: PortMirror[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class PortMirrorActionResp {
  @Field(() => PortMirror, { nullable: true })
  result?: PortMirror

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
