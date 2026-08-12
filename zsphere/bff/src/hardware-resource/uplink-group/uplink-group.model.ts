import { ArgsType, Field, InputType, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

import { Bond } from '../bond/bond.model'
import { HostVO } from '../host/host.model'
import { PhysicalNic } from '../pci-device/pci-device.model'

export enum UplinkGroupQueryType {
  Normal = 'Normal'
}
registerEnumType(UplinkGroupQueryType, {
  name: 'UplinkGroupQueryType'
})

export enum UplinkGroupType {
  PhysicalInterface = 'PhysicalInterface',
  Bonding = 'Bonding'
}
registerEnumType(UplinkGroupType, {
  name: 'UplinkGroupType'
})

@ArgsType()
export class QueryUplinkGroupArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => UplinkGroupQueryType, {
    nullable: true,
    defaultValue: UplinkGroupQueryType.Normal
  })
  declare type?: UplinkGroupQueryType
}

@ObjectType()
export class UplinkGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => String)
  hostUuid: string

  @Field(() => HostVO, { nullable: true })
  host?: HostVO

  @Field(() => String, { nullable: true })
  interfaceUuid?: string

  @Field(() => String)
  interfaceName: string

  @Field(() => PhysicalNic, { nullable: true })
  physicalNic?: PhysicalNic

  @Field(() => String, { nullable: true })
  bondingUuid?: string

  @Field(() => Bond, { nullable: true })
  bond?: Bond

  @Field(() => UplinkGroupType)
  type: UplinkGroupType

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class UplinkGroupList extends QueryCommonResponse(UplinkGroup) {}
