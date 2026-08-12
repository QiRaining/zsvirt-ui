import { Field, ObjectType, InputType, Int, Float } from '@nestjs/graphql'

import { Condition } from '@/common/model/action-query.model'

@InputType()
export class QueryMetriDataParams {
  @Field(() => String)
  value: string

  @Field(() => String)
  namespace: string

  @Field(() => String)
  metricName: string

  @Field(() => Int, { nullable: true })
  offsetAheadOfCurrentTime: number

  @Field(() => String, { nullable: true })
  zoneKey: string

  @Field(() => String, { nullable: true })
  zoneUuid: string

  @Field(() => [Condition], { nullable: true })
  defaultConditions: Condition[]
}

@ObjectType()
export class Label {
  @Field(() => String, { nullable: true })
  BackupStorageType: string

  @Field(() => String, { nullable: true })
  BackupStorageUuid: string
}

@ObjectType()
export class MetriData {
  @Field(() => Int, { nullable: true })
  time: number

  @Field(() => Float, { nullable: true })
  value: number

  @Field(() => Label, { nullable: true })
  labels: Label
}

@ObjectType()
export class ResourceData {
  @Field(() => Float, { nullable: true })
  totalCapacity: number

  @Field(() => Float, { nullable: true })
  usedCapacity: number

  @Field(() => Float, { nullable: true })
  availableCapacity: number

  @Field(() => Float, { nullable: true })
  usedPercent: number
}

@ObjectType()
export class MetriDataList {
  @Field(() => [MetriData], { defaultValue: [] })
  percentList: MetriData[]

  @Field(() => ResourceData, {
    defaultValue: {
      totalCapacity: 0,
      usedCapacity: 0,
      usedPercent: 0,
      availableCapacity: 0
    }
  })
  capacityData: ResourceData
}
