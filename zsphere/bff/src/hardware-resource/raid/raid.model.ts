import { ObjectType, Field, ArgsType, registerEnumType } from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

export enum RaidLevelState {
  Normal = 'Normal',
  Degraged = 'Degraged',
  Rebuild = 'Rebuild',
  Abnormal = 'Abnormal',
  Unknown = 'Unknown'
}
registerEnumType(RaidLevelState, {
  name: 'RaidLevelState'
})

@ObjectType()
export class Raid {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => [String], { nullable: true })
  raidLevel?: string[]

  @Field(() => [RaidLevelState], { nullable: true })
  raidLevelState?: RaidLevelState[]

  @Field(() => [[String]], { nullable: true })
  relatedDisk?: string[][]
}

@ArgsType()
export class QueryRaidArgs extends QueryAction {}

@ObjectType()
export class QueryRaidResp extends QueryCommonResponse(Raid) {}
