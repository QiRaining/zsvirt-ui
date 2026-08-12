import { Field, InputType, ObjectType } from '@nestjs/graphql'

import { ClientInfo } from './login.model'

@ObjectType()
export class LogOutResp {
  @Field(() => String, { nullable: true })
  sessionId?: string
}

@InputType()
export class LogOutInput {
  @Field(() => String, { nullable: true })
  sessionUuid?: string

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo
}
