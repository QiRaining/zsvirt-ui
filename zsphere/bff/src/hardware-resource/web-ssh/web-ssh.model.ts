import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class WebSSH {
  @Field(() => Float, { nullable: true })
  socketTimeout: number
}
