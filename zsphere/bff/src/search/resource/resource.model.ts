import { ArgsType, Field, Float, ObjectType } from '@nestjs/graphql'

@ArgsType()
export class SearchResourceInput {
  @Field(() => String, { nullable: true })
  keyword?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string
}

@ObjectType()
export class SearchResource {
  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  resourceZhName?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class SearchResourceResp {
  @Field(() => [SearchResource], { nullable: true })
  list?: SearchResource[]

  @Field(() => Float, { nullable: true })
  total?: number
}
