import { Field, ObjectType, registerEnumType, ArgsType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

export enum ThirdpartyPlatformQueryType {
  Normal = 'Normal',
  ClusterAttachablePxeServer = 'ClusterAttachablePxeServer',
  ZCEX = 'ZCEX'
}

registerEnumType(ThirdpartyPlatformQueryType, {
  name: 'ThirdpartyPlatformQueryType'
})

@ArgsType()
export class QueryClusterArgs extends QueryAction {
  @Field(() => ThirdpartyPlatformQueryType, { nullable: true })
  declare type?: ThirdpartyPlatformQueryType
}

@ObjectType()
export class Owners {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  name: string
}

@ObjectType()
export class ThirdpartyPlatform {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => Owners, { nullable: true })
  owner?: Owners

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  url: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastSyncDate: string

  @Field(() => String, { nullable: true })
  template: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ThirdpartyPlatformQueryResp {
  @Field(() => [ThirdpartyPlatform], { nullable: true })
  list?: ThirdpartyPlatform[]

  @Field(() => Int, { nullable: true })
  total?: number
}
