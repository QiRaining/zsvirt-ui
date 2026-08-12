import { Field, Int, ObjectType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class ResourceAttributeConstraint {
  @Field(() => BigInt)
  id: number

  @Field(() => String)
  keyUuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  parameter: string

  @Field(() => Int, { nullable: true })
  resourceCount?: number

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class ResourceAttributeKey {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => [String], { nullable: true })
  resourceTypes?: string[]

  @Field(() => [ResourceAttributeConstraint], { nullable: true })
  constraints?: ResourceAttributeConstraint[]

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class ResourceAttributeValue {
  @Field(() => String)
  keyUuid: string

  @Field(() => ResourceAttributeKey)
  key: ResourceAttributeKey

  @Field(() => String)
  value: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String)
  resourceType: string

  @Field(() => String)
  createDate: string
}

@ObjectType()
export class ResourceWithAttributes {
  @Field(() => [ResourceAttributeValue], { nullable: true })
  resourceAttributeValues?: ResourceAttributeValue[]
}

@ObjectType()
export class ResourceAttributeConstraintResponse extends QueryCommonResponse(
  ResourceAttributeConstraint
) {}

@ObjectType()
export class ResourceAttributeKeyResponse extends QueryCommonResponse(ResourceAttributeKey) {}

@ObjectType()
export class ResourceAttributeValueResponse extends QueryCommonResponse(ResourceAttributeValue) {}
