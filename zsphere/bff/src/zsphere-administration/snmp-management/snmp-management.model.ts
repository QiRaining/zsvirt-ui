import { Int, Field, ArgsType, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum SnmpTrapReceiverQueryType {
  Normal = 'Normal'
}

registerEnumType(SnmpTrapReceiverQueryType, {
  name: 'SnmpTrapReceiverQueryType'
})

@ObjectType()
export class SnmpAgent {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => String, { nullable: true })
  readCommunity?: string

  @Field(() => String, { nullable: true })
  userName?: string

  @Field(() => String, { nullable: true })
  authAlgorithm?: string

  @Field(() => String, { nullable: true })
  authPassword?: string

  @Field(() => String, { nullable: true })
  privacyAlgorithm?: string

  @Field(() => String, { nullable: true })
  privacyPassword?: string

  @Field(() => String, { nullable: true })
  securityLevel?: string

  @Field(() => String, { nullable: true })
  status?: string
}

@ObjectType()
export class SnmpAgentActionResp {
  @Field(() => SnmpAgent, { nullable: true })
  result?: SnmpAgent

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class SnmpTrapReceiver {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Int, { nullable: true })
  snmpPort?: number

  @Field(() => String, { nullable: true })
  snmpAddress?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SnmpTrapReceiverList {
  @Field(() => [SnmpTrapReceiver])
  list: SnmpTrapReceiver[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QuerySnmpTrapReceiverArgs extends QueryAction {
  @Field(() => SnmpTrapReceiverQueryType, { nullable: true })
  declare type?: SnmpTrapReceiverQueryType
}

@ObjectType()
export class SnmpTrapReceiverActionResp {
  @Field(() => SnmpTrapReceiver, { nullable: true })
  result?: SnmpTrapReceiver

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
