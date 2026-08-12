import { Int, Field, ObjectType, InputType, ArgsType, registerEnumType } from '@nestjs/graphql'

import { MonStatus } from '@/common/enum/zstack'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class CephMon {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  backupStorageUuid: string

  @Field(() => String, { nullable: true })
  hostname: string

  @Field(() => String, { nullable: true })
  monAddr: string

  @Field(() => String, { nullable: true })
  monPort: string

  @Field(() => String)
  monUuid: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid: string

  @Field(() => Int, { nullable: true })
  sshPort: number

  @Field(() => String, { nullable: true })
  sshPassword: string

  @Field(() => String, { nullable: true })
  sshUsername: string

  @Field(() => MonStatus, { nullable: true })
  status: MonStatus
}

@ObjectType()
export class MonsQueryResp extends QueryCommonResponse(CephMon) {}

@ObjectType()
export class MonsActionResp {
  @Field(() => CephMon, { nullable: true })
  result?: CephMon

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export enum CephMonType {
  PrimaryStorage = 'PrimaryStorage',
  BackupStorage = 'BackupStorage'
}

registerEnumType(CephMonType, {
  name: 'CephMonType'
})

@ArgsType()
export class QueryMonsArgs extends QueryAction {
  @Field(() => CephMonType, { nullable: true })
  declare type?: CephMonType
}

@InputType()
export class DeleteMonsInput {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  monHostnames: string[]

  @Field(() => CephMonType)
  type: CephMonType
}

@InputType()
export class AddMonsInput {
  @Field(() => String)
  uuid: string

  @Field(() => [String])
  monUrls: string[]

  @Field(() => CephMonType)
  type: CephMonType
}

@InputType()
export class UpdateMonsInput {
  @Field(() => String)
  monUuid: string

  @Field(() => String, { nullable: true })
  sshUsername?: string

  @Field(() => String, { nullable: true })
  sshPassword?: string

  @Field(() => Int, { nullable: true })
  sshPort?: number

  @Field(() => Int, { nullable: true })
  monPort?: number

  @Field(() => CephMonType)
  type: CephMonType
}
