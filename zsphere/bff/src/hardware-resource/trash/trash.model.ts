import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'

import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class Trash {
  @Field(() => Int)
  uuid: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  resourceUuid: string

  @Field(() => Int)
  trashId: number

  @Field(() => String, { nullable: true })
  installPath: string

  @Field(() => Float, { nullable: true })
  size: number

  @Field(() => String, {
    nullable: true,
    description: 'BackupStorageVO | PrimaryStorageVO'
  })
  storageType: string

  @Field(() => String, { nullable: true })
  trashType: string
}

@ObjectType()
export class TrashResp extends QueryCommonResponse(Trash) {}

@ObjectType()
export class TrashActionResp {
  @Field(() => Float, { nullable: true })
  result?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export enum TrashQueryType {
  PrimaryStorage = 'PrimaryStorage',
  BackupStorage = 'BackupStorage'
}

registerEnumType(TrashQueryType, {
  name: 'TrashQueryType'
})

@ArgsType()
@ObjectType()
export class QueryTrashArgs extends QueryAction {
  @Field(() => TrashQueryType, { nullable: true })
  declare type?: TrashQueryType
}

@InputType()
export class CleanUpInput {
  @Field(() => String)
  uuid: string

  @Field(() => [Int], { nullable: true })
  trashIds: number[]

  @Field(() => TrashQueryType)
  type: TrashQueryType
}

export enum InstallPathRecycleQueryType {
  NORMAL = 'NORMAL'
}

registerEnumType(InstallPathRecycleQueryType, {
  name: 'InstallPathRecycleQueryType'
})

@ObjectType()
export class InstallPathRecycle {
  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => String, { nullable: true })
  storageType?: string

  @Field(() => String, { nullable: true })
  storageUuid?: string

  @Field(() => String, { nullable: true })
  trashId?: string

  @Field(() => String, { nullable: true })
  trashType?: string
}

@ObjectType()
export class InstallPathRecycleResp {
  @Field(() => Int)
  total: number

  @Field(() => [InstallPathRecycle], { defaultValue: [] })
  list?: InstallPathRecycle[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
