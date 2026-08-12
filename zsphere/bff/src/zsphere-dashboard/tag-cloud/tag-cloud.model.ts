import { Field, ObjectType, ArgsType, Int } from '@nestjs/graphql'

@ObjectType()
export class TagCloud {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => Int, { nullable: true })
  value: number
}

@ArgsType()
export class QueryTagCloudArgs {
  @Field(() => String)
  resourceType: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string
}
