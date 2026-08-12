import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ActionSendResp {
  @Field(type => String)
  actionId?: string

  @Field(type => Boolean)
  success: boolean

  @Field(type => String, { nullable: true })
  error?: string
}
