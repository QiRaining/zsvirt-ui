import { Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Host } from '@/hardware-resource/host/host.model'
import { VmInstance } from '@/zsphere-resource/vm-instance/vm-instance.model'

import { CommonOwner } from '../owner/owner.model'

export enum SchedTypes {
  VMHA = 'VMHA',
  HMT = 'HMT'
}

registerEnumType(SchedTypes, {
  name: 'SchedTypes'
})

@ObjectType()
export class SchedHistoryLog {
  @Field(() => String, { nullable: true })
  id?: string

  @Field(() => SchedTypes, { nullable: true })
  schedType?: SchedTypes

  @Field(() => Boolean, { nullable: true })
  success?: boolean

  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  schedReason?: string

  @Field(() => String, { nullable: true })
  failReason?: string

  @Field(() => String, { nullable: true })
  lastHostUuid?: string

  @Field(() => String, { nullable: true })
  destHostUuid?: string

  @Field(() => String, { nullable: true })
  slbUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => VmInstance, { nullable: true })
  vmInstance?: VmInstance

  @Field(() => CommonOwner, { nullable: true })
  owner?: CommonOwner

  @Field(() => Host, { nullable: true })
  preHost?: Host

  @Field(() => Host, { nullable: true })
  destHost?: Host
}

@ObjectType()
export class SchedHistoryLogList {
  @Field(() => [SchedHistoryLog], { defaultValue: [] })
  list?: SchedHistoryLog[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class QuerySchedHistoryLogResp extends QueryCommonResponse(SchedHistoryLog) {}
