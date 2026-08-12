import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class CustomColumnsConfig {
  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => String, { nullable: true })
  customColumnConfig: string
}
