import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { PreconfigurationTemplateState, PreconfigurationTemplateType } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Owner } from '@/zsphere-resource/image/image.model'

export enum PreconfigurationTemplateQueryType {
  NORMAL = 'NORMAL'
}

registerEnumType(PreconfigurationTemplateQueryType, {
  name: 'PreconfigurationTemplateQueryType'
})

@ObjectType()
export class PreconfigurationTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => PreconfigurationTemplateState, { nullable: true })
  state?: PreconfigurationTemplateState

  @Field(() => PreconfigurationTemplateType, { nullable: true })
  type?: PreconfigurationTemplateType

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  content?: string

  @Field(() => String, { nullable: true })
  distribution?: string

  @Field(() => Boolean, { nullable: true })
  isPredefined?: boolean

  @Field(() => [String], { nullable: true })
  customParams?: string[]

  @Field(() => String, { nullable: true })
  md5sum?: string

  @Field(() => Owner, { nullable: true })
  owner?: Owner

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class PreconfigurationTemplateQueryResp {
  @Field(() => [PreconfigurationTemplate], { nullable: true })
  list?: PreconfigurationTemplate[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryPreconfigurationTemplateArgs extends QueryAction {}
