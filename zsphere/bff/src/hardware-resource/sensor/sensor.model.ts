import { ObjectType, Field, ArgsType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

export enum SensorType {
  Temperature = 'Temperature',
  Current = 'Current',
  Voltage = 'Voltage',
  Fan = 'Fan'
}

registerEnumType(SensorType, {
  name: 'SensorType'
})

@ObjectType()
export class Sensor {
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  classification?: string

  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => BigInt)
  lastUpdateTime: number
}

@ArgsType()
export class QuerySensorArgs extends QueryAction {}

@ObjectType()
export class QuerySensorResp extends QueryCommonResponse(Sensor) {}
