import {
  ArgsType,
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  OmitType,
  registerEnumType
} from '@nestjs/graphql'

import { Condition, QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum TagQueryType {
  NORMAL = 'NORMAL',
  GetTagWhenCreateResource = 'GetTagWhenCreateResource'
}

registerEnumType(TagQueryType, {
  name: 'TagQueryType'
})

@ArgsType()
export class QueryTagArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => TagQueryType, { nullable: true })
  type?: TagQueryType

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => [Condition], { nullable: true })
  resourceConditions?: Condition[]
}

@ObjectType()
export class TagOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  name: string
}

@InputType()
export class Owners {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  name: string
}
@InputType()
export class ResourceList {
  @Field(() => [String], { nullable: true })
  myUserTagUuidListArray: string[]

  @Field(() => [Owners], { nullable: true })
  owner: Owners[]

  @Field(() => [String], { nullable: true })
  otherUserTagUuidListArray: string[]

  @Field(() => String, { nullable: true })
  uuid: string
}
@InputType()
export class HandleTagListInput {
  @Field(() => String, { nullable: true })
  currentTab?: string

  @Field(() => [ResourceList], { nullable: true })
  resourceList?: ResourceList[]

  @Field(() => String, { nullable: true })
  queryTypes?: string

  @Field(() => Boolean, { nullable: true })
  showTabs?: boolean
}

@ObjectType()
export class Tag {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  ownerUuid?: string

  @Field(() => TagOwner, { nullable: true })
  owner: TagOwner

  @Field(() => String, { nullable: true })
  ordinal?: string

  @Field(() => String, { nullable: true })
  value?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  color?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Int, { nullable: true })
  resourceCount?: number
}

@ObjectType()
export class NoTagResourceResp {
  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => Int, { nullable: true })
  count?: number
}

@ObjectType()
export class TagRelatedSummary {
  @Field(() => Int, { nullable: true })
  host: number

  @Field(() => Int, { nullable: true })
  vm: number

  @Field(() => Int, { nullable: true })
  volume: number

  @Field(() => Int, { nullable: true })
  baremetalInstance: number

  @Field(() => Int, { nullable: true })
  baremetal2Instance: number

  @Field(() => Int, { nullable: true })
  monitorGroup: number

  @Field(() => Int, { nullable: true })
  monitorTemplate: number
}

@ObjectType()
export class SystemTag {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  tag?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => Boolean, { nullable: true })
  inherent?: boolean
}

@ObjectType()
export class TagPattern {
  @Field(() => String, { nullable: true })
  color?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  value?: string
}

@ObjectType()
export class UserTag {
  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  tag?: string

  @Field(() => TagPattern, { nullable: true })
  tagPattern?: TagPattern

  @Field(() => String, { nullable: true })
  tagPatternUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class TagQueryResp {
  @Field(() => [Tag], { nullable: true })
  list?: Tag[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class SystemTagQueryResp {
  @Field(() => [SystemTag], { nullable: true })
  list?: SystemTag[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class TagActionResp {
  @Field(() => Tag, { nullable: true })
  inventory?: Tag

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
