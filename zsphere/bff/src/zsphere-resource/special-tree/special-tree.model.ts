import { Field, ObjectType } from '@nestjs/graphql'

import { ResourceTypeVO } from '@/common/enum'
import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class Attribute {
  @Field(() => String)
  type: string

  @Field(() => String)
  value: string
}

@ObjectType()
export class SpecialTree {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  key: string

  @Field(() => String)
  name: string

  @Field(() => String)
  title: string

  @Field(() => ResourceTypeVO, { nullable: true })
  resourceTypeVO?: ResourceTypeVO

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  iconType?: string

  @Field(() => [Attribute], { nullable: true })
  extraAttrib?: Attribute[]

  @Field(() => Boolean, { nullable: true })
  isLeaf?: boolean

  @Field(() => [SpecialTree], { nullable: true, defaultValue: [] })
  children?: SpecialTree[]
}

@ObjectType()
export class SpecialTreeList {
  @Field(() => [SpecialTree], { defaultValue: [] })
  list?: SpecialTree[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
