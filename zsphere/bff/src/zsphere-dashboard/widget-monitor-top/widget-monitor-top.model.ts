import {
  Field,
  ObjectType,
  InputType,
  IntersectionType,
  PickType,
  PartialType,
  Int,
  ArgsType,
  registerEnumType,
  Float
} from '@nestjs/graphql'

import { L3Network } from '@/network-resource/l3-network/l3-network.model'

@ArgsType()
export class WidgetMonitorTopInput {
  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Int)
  limit: number

  @Field(() => String)
  namespace: string

  @Field(() => String)
  metricName: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => Int, { nullable: true })
  offsetAheadOfCurrentTime?: number
}

@ObjectType()
export class WidgetMonitorTopItem {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String || Float, { nullable: true })
  value: string | number
}

@ObjectType()
export class WidgetMonitorTop {
  @Field(() => [WidgetMonitorTopItem], { nullable: true })
  list: WidgetMonitorTopItem[]

  @Field(() => Float, { nullable: true })
  valueMax: number
}

@ObjectType()
export class WidgetMonitorTopL3Network {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String || Float, { nullable: true })
  value: string | number

  @Field(() => L3Network, { nullable: true })
  l3Network: L3Network
}

@ObjectType()
export class WidgetMonitorL3NetworkTop {
  @Field(() => [WidgetMonitorTopL3Network], { nullable: true })
  list: WidgetMonitorTopL3Network[]

  @Field(() => Float, { nullable: true })
  valueMax: number
}
