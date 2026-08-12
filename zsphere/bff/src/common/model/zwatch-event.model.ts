import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ZWatchEvent {
  @Field(() => String, { description: 'websocket消息按照 sessionId 分发' })
  sessionId: string

  @Field(() => String, {
    nullable: true,
    description: 'ZWatch消息'
  })
  payload?: string
}
