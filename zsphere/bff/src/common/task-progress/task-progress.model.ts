import { ObjectType, Field, ArgsType, registerEnumType, Float } from '@nestjs/graphql'
export enum TaskProgressQueryType {
  NORMAL = 'NORMAL'
}
registerEnumType(TaskProgressQueryType, {
  name: 'TaskProgressQueryType'
})

@ObjectType()
export class TaskOpaque {
  @Field(() => String, { nullable: true })
  remain?: string

  @Field(() => String, { nullable: true })
  remaining_migration_time?: string

  @Field(() => String, { nullable: true })
  speed?: string

  @Field(() => String, { nullable: true })
  total?: string
}

@ObjectType()
export class TaskProgress {
  @Field(() => String, { nullable: true })
  taskUuid?: string

  @Field(() => String, { nullable: true })
  taskName?: string

  @Field(() => String, { nullable: true })
  parentUuid?: string

  @Field(() => TaskOpaque, { nullable: true })
  opaque?: TaskOpaque

  @Field(() => String, { nullable: true })
  arguments?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  content?: string

  @Field(() => Float, { nullable: true })
  time?: number
}

@ArgsType()
export class QueryTaskProgressArgs {
  @Field(() => Boolean, { nullable: true })
  all?: boolean

  @Field(() => String)
  apiId: string

  @Field(() => TaskProgressQueryType, { nullable: true })
  type?: TaskProgressQueryType

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  userTags?: string[]
}

@ObjectType()
export class TaskProgressList {
  @Field(() => [TaskProgress], { defaultValue: [] })
  list?: TaskProgress[]

  @Field(() => Float, { nullable: true })
  total?: number
}
