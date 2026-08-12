import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError, ISimpleActionResp } from '@/common/model/action-resp.model'
import { ActionInput } from '@/common/model/action.model'

export enum VRouterRouteEntryType {
  'UserStatic' = 'UserStatic',
  'UserBlackHole' = 'UserBlackHole'
}
registerEnumType(VRouterRouteEntryType, {
  name: 'VRouterRouteEntryType'
})
@ObjectType()
export class VRouterRouteEntry {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  routeTableUuid: string

  @Field(() => VRouterRouteEntryType)
  type: VRouterRouteEntryType

  @Field(() => String, { nullable: true, description: '下一跳' })
  target: string

  @Field(() => String)
  destination: string

  @Field(() => Int, { description: '路由优先级' })
  distance: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class VRouterRouteEntryQueryResp extends QueryCommonResponse(VRouterRouteEntry) {}

@InputType()
export class CreateVRouterRouteEntryInput {
  @Field(() => String)
  routeTableUuid: string

  @Field(() => VRouterRouteEntryType)
  type: VRouterRouteEntryType

  @Field(() => String, { nullable: true })
  target?: string

  @Field(() => String)
  destination: string

  @Field(() => Int)
  distance: number

  @Field(() => String, { nullable: true })
  description?: string
}
@InputType()
export class DeleteVRouterRouteEntryInput {
  @Field(() => String)
  routeTableUuid: string

  @Field(() => String)
  uuid: string
}

@InputType()
export class AttachOrDetachVRouterRouteTableToVRouterInput {
  @Field(() => String)
  routeTableUuid: string

  @Field(() => String)
  virtualRouterVmUuid: string
}
@InputType()
export class AttachOrDetachVRouterRouteTableToVRouterActionInput {
  @Field(() => [AttachOrDetachVRouterRouteTableToVRouterInput])
  payload: AttachOrDetachVRouterRouteTableToVRouterInput[]

  @Field(() => ActionInput)
  action: ActionInput
}
// @InputType()
// export class CreateVRouterRouteTableInput {
//   @Field(() => String)
//   name: string

//   @Field(() => String)
//   description: string

//   @Field(() => String, { nullable: true })
//   virtualRouterVmUuid?: string
// }

@ObjectType()
export class AttachedRouterRef {
  @Field(() => String)
  routeTableUuid: string

  @Field(() => String)
  virtualRouterVmUuid: string
}

@ObjectType()
export class VRouterRouteTable {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [AttachedRouterRef], { nullable: true })
  attachedRouterRefs?: AttachedRouterRef[]

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => [VRouterRouteEntry], { nullable: true })
  routeEntries?: VRouterRouteEntry[]
}

@ObjectType()
export class VRouterRouteTableListResp {
  @Field(() => [VRouterRouteTable])
  list: VRouterRouteTable[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class VRouterRouteEntryListResp {
  @Field(() => [VRouterRouteEntry])
  list: VRouterRouteEntry[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class VRouterRouteTableActionResp extends QueryCommonResponse(VRouterRouteTable) {}

@ObjectType()
export class VRouterRouteTableResp extends ISimpleActionResp {
  @Field(() => VRouterRouteTable, { nullable: true })
  declare result?: VRouterRouteTable
}
