import { ArgsType, Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum BlockSnapshotStatus {
  Active = 'Active',
  Warning = 'Warning',
  Error = 'Error',
  Ready = 'Ready'
}

registerEnumType(BlockSnapshotStatus, {
  name: 'BlockSnapshotStatus'
})

export enum BlockSnapshotState {
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

registerEnumType(BlockSnapshotState, {
  name: 'BlockSnapshotState'
})

@ObjectType()
export class BlockSnapshot {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => BlockSnapshotStatus, { nullable: true })
  status?: BlockSnapshotStatus

  @Field(() => BlockSnapshotState, { nullable: true })
  state?: BlockSnapshotState

  @Field(() => String)
  blockVolumeUuid: string

  @Field(() => String)
  treeUuid: string

  @Field(() => Float)
  size: number

  @Field(() => Float)
  actualSize: number

  @Field(() => Boolean, { nullable: true })
  latest?: boolean

  @Field(() => Boolean, { nullable: true })
  current?: boolean

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class BlockSnapshotList {
  @Field(() => [BlockSnapshot])
  list: BlockSnapshot[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryBlockSnapshotArgs extends QueryAction {}

@ObjectType()
export class BlockSnapshotQueryResp {
  @Field(() => [BlockSnapshot], { nullable: true })
  list?: BlockSnapshot[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class BlockSnapshotActionResp {
  @Field(() => BlockSnapshot, { nullable: true })
  result?: BlockSnapshot

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
