import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class AsyncQuery {
  @Field({ description: 'asyncQuery查询结果 按sessionId 分发' })
  sessionId: string

  @Field({ description: 'asyncQuery查询结果 按queryName 分发' })
  queryName: string

  @Field({ description: 'asyncQuery查询结果 queryId 分发' })
  queryId: string

  @Field(() => [String])
  inventories: string[]
}
