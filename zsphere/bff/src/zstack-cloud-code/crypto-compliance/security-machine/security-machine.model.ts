import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum SecurityMachineQueryType {
  'Normal' = 'Normal'
}
registerEnumType(SecurityMachineQueryType, {
  name: 'SecurityMachineQueryType'
})
@ArgsType()
export class QuerySecurityMachineArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => SecurityMachineQueryType, {
    nullable: true,
    defaultValue: SecurityMachineQueryType.Normal
  })
  declare type?: SecurityMachineQueryType
}

export enum SecurityMachineState {
  Enabled = 'Enabled',
  Disabled = 'Disabled',
  Exception = 'Exception'
}

registerEnumType(SecurityMachineState, { name: 'SecurityMachineState' })

export enum SecurityMachineType {
  OrdinarySecurityMachine = 'OrdinarySecurityMachine',
  CloudSecurityMachine = 'CloudSecurityMachine',
  CloudSecurityResourceService = 'CloudSecurityResourceService'
}
registerEnumType(SecurityMachineType, { name: 'SecurityMachineType' })

export enum SecurityMachineStatus {
  Synced = 'Synced',
  Unsynced = 'Unsynced'
}
registerEnumType(SecurityMachineStatus, { name: 'SecurityMachineStatus' })

@ObjectType()
export class AsyncSecurityMachineTotal {
  @Field(() => Int)
  unsyncedTotal: number
}

@ObjectType()
export class SecurityMachine {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => SecurityMachineState)
  declare state: SecurityMachineState

  @Field(() => SecurityMachineStatus)
  declare status: SecurityMachineStatus

  @Field(() => String)
  managementIp: string

  @Field(() => Int)
  port?: number

  @Field(() => SecurityMachineType)
  declare type: SecurityMachineType

  @Field(() => String, { nullable: true })
  secretResourcePoolUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SecurityMachineList {
  @Field(() => [SecurityMachine], { defaultValue: [] })
  list?: SecurityMachine[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
