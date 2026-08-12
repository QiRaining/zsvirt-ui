import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum DirectoryQueryType {
  'Normal' = 'Normal'
}

registerEnumType(DirectoryQueryType, {
  name: 'DirectoryQueryType'
})

@ArgsType()
export class QueryDirArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => DirectoryQueryType, {
    nullable: true,
    defaultValue: DirectoryQueryType.Normal
  })
  declare type?: DirectoryQueryType
}

@ObjectType()
export class DirectoryItem {
  @Field(() => String)
  key: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  title: string

  @Field(() => String)
  name?: string

  @Field(() => String)
  parentUuid?: string

  @Field(() => Int)
  count?: number

  @Field(() => Int)
  level?: number

  @Field(() => String, { nullable: true })
  groupName?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ObjectType()
export class DirectoryClusterItem {
  @Field(() => String)
  key: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  title: string

  @Field(() => String)
  parentUuid?: string

  @Field(() => Int)
  vmCount?: number

  @Field(() => Int)
  level?: number

  @Field(() => String, { nullable: true })
  groupName?: string
}

@ObjectType()
export class VMGroupDirectory {
  @Field(() => String)
  key: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  zoneUuid: string

  @Field(() => String)
  title?: string

  @Field(() => String)
  name?: string

  @Field(() => String)
  type?: string

  @Field(() => Int, { nullable: true })
  vmCount?: number

  @Field(() => String, { nullable: true })
  parentUuid?: string

  @Field(() => String)
  groupName?: string

  @Field(() => Int, { nullable: true })
  count?: number

  @Field(() => Int, { nullable: true })
  level?: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ObjectType()
export class VMClusterDirectory {
  @Field(() => String)
  key: string

  @Field(() => String)
  uuid: string

  @Field(() => String)
  title: string

  @Field(() => String)
  parentUuid?: string

  @Field(() => Int)
  vmCount?: number

  @Field(() => Int)
  level?: number

  @Field(() => [DirectoryClusterItem])
  children?: DirectoryClusterItem[]

  @Field(() => Int)
  groupChildren?: number
}

@ObjectType()
export class VMGroupDirectoryList {
  @Field(() => [VMGroupDirectory], { defaultValue: [] })
  list?: VMGroupDirectory[]

  @Field(() => Int)
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
@ObjectType()
export class VMClusterDirectoryList {
  @Field(() => [VMClusterDirectory], { defaultValue: [] })
  children?: VMClusterDirectory[]

  @Field(() => Int)
  vmCount?: number

  @Field(() => Int)
  level: number

  @Field(() => String)
  key: string

  @Field(() => String)
  uuid: string

  @Field(() => [String])
  expandedKeys?: string[]

  @Field(() => String)
  title: string

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
