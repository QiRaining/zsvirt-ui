import { Int, Field, ObjectType, ArgsType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum MdsStatus {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected'
}

registerEnumType(MdsStatus, {
  name: 'MdsStatus'
})

// 定义可修改的MDS配置类型
export enum MdsConfigType {
  SSH_PORT = 'sshPort',
  SSH_USERNAME = 'sshUsername',
  SSH_PASSWORD = 'sshPassword'
}

registerEnumType(MdsConfigType, {
  name: 'MdsConfigType'
})

@ObjectType()
export class CbdMds {
  @Field(() => Int, { nullable: true })
  port: number

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  addr: string

  @Field(() => MdsStatus, { nullable: true })
  status: MdsStatus

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true, defaultValue: '' })
  externalAddr?: string
}

@ObjectType()
export class MdsQueryResp extends QueryCommonResponse(CbdMds) {}

@ObjectType()
export class MdsActionResp {
  @Field(() => CbdMds, { nullable: true })
  result?: CbdMds

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryMdsArgs extends QueryAction {}
