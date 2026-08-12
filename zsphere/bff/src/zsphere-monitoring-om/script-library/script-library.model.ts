import { ArgsType, Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql'

import { ImagePlatform } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { VmInstanceBase } from '@/zsphere-resource/vm-instance/vm-instance-base.model'

export enum ScriptType {
  Shell = 'Shell',
  Python = 'Python',
  Perl = 'Perl',
  Bat = 'Bat',
  Powershell = 'Powershell'
}
registerEnumType(ScriptType, {
  name: 'ScriptType'
})

export enum ScriptEncodingType {
  Base64 = 'Base64',
  PlainText = 'PlainText'
}
registerEnumType(ScriptEncodingType, {
  name: 'ScriptEncodingType'
})

export enum GuestVmScriptQueryType {
  NORMAL = 'NORMAL'
}
registerEnumType(GuestVmScriptQueryType, {
  name: 'GuestVmScriptQueryType'
})

@ArgsType()
export class QueryGuestVmScriptArgs extends QueryAction {
  @Field(() => GuestVmScriptQueryType, {
    nullable: true,
    defaultValue: GuestVmScriptQueryType.NORMAL
  })
  declare type?: GuestVmScriptQueryType
}
@ObjectType()
export class Script {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  scriptContent?: string

  @Field(() => String, { nullable: true })
  renderParams?: string

  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  @Field(() => ScriptType, { nullable: true })
  scriptType?: ScriptType

  @Field(() => ScriptEncodingType, { nullable: true })
  encodingType?: ScriptEncodingType

  @Field(() => Float, { nullable: true })
  scriptTimeout?: number

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ScriptList {
  @Field(() => [Script])
  list: Script[]

  @Field(() => Float)
  total: number
}

export enum ScriptExecuteRecordStatus {
  Running = 'Running',
  Succeed = 'Succeed',
  Exception = 'Exception',
  Failed = 'Failed'
}
registerEnumType(ScriptExecuteRecordStatus, {
  name: 'ScriptExecuteRecordStatus'
})

export enum GuestVmScriptExecutedRecordQueryType {
  NORMAL = 'NORMAL'
}
registerEnumType(GuestVmScriptExecutedRecordQueryType, {
  name: 'GuestVmScriptExecutedRecordQueryType'
})

@ArgsType()
export class QueryGuestVmScriptExecutedRecordArgs extends QueryAction {
  @Field(() => GuestVmScriptExecutedRecordQueryType, {
    nullable: true,
    defaultValue: GuestVmScriptExecutedRecordQueryType.NORMAL
  })
  declare type?: GuestVmScriptExecutedRecordQueryType

  @Field(() => String, { nullable: true, defaultValue: 'startTime' })
  sortBy?: string
}

@ObjectType()
export class ScriptExecuteRecord {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  recordName?: string

  @Field(() => Float, { nullable: true })
  executionCount?: number

  @Field(() => String, { nullable: true })
  executor?: string

  @Field(() => String, { nullable: true })
  scriptUuid?: string

  @Field(() => String, { nullable: true })
  scriptContent?: string

  @Field(() => String, { nullable: true })
  renderParams?: string

  @Field(() => ScriptExecuteRecordStatus, { nullable: true })
  status?: ScriptExecuteRecordStatus

  @Field(() => ScriptEncodingType, { nullable: true })
  encodingType?: ScriptEncodingType

  @Field(() => String, { nullable: true })
  startTime?: string

  @Field(() => String, { nullable: true })
  endTime?: string

  @Field(() => Script, { nullable: true })
  relatedScript?: Script
}

@ObjectType()
export class ScriptExecuteRecordList {
  @Field(() => [ScriptExecuteRecord])
  list: ScriptExecuteRecord[]

  @Field(() => Float)
  total: number
}

export enum ScriptExecuteRecordDetailStatus {
  Uploading = 'Uploading',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed'
}
registerEnumType(ScriptExecuteRecordDetailStatus, {
  name: 'ScriptExecuteRecordDetailStatus'
})

export enum GuestVmScriptExecutedRecordDetailQueryType {
  NORMAL = 'NORMAL'
}
registerEnumType(GuestVmScriptExecutedRecordDetailQueryType, {
  name: 'GuestVmScriptExecutedRecordDetailQueryType'
})

@ArgsType()
export class QueryGuestVmScriptExecutedRecordDetailArgs extends QueryAction {
  @Field(() => GuestVmScriptExecutedRecordDetailQueryType, {
    nullable: true,
    defaultValue: GuestVmScriptExecutedRecordDetailQueryType.NORMAL
  })
  declare type?: GuestVmScriptExecutedRecordDetailQueryType

  @Field(() => String, { nullable: true, defaultValue: 'startTime' })
  sortBy?: string
}

@ObjectType()
export class ScriptExecuteRecordDetail {
  @Field(() => String)
  recordUuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  vmName?: string

  @Field(() => VmInstanceBase, { nullable: true })
  vmInstance?: VmInstanceBase

  @Field(() => ScriptExecuteRecordDetailStatus, { nullable: true })
  status?: ScriptExecuteRecordDetailStatus

  @Field(() => Float, { nullable: true })
  exitCode?: number

  @Field(() => String, { nullable: true })
  stdout?: string

  @Field(() => String, { nullable: true })
  errCause?: string

  @Field(() => String, { nullable: true })
  stderr?: string

  @Field(() => String, { nullable: true })
  startTime?: string

  @Field(() => String, { nullable: true })
  endTime?: string
}

@ObjectType()
export class ScriptExecuteRecordDetailList {
  @Field(() => [ScriptExecuteRecordDetail])
  list: ScriptExecuteRecordDetail[]

  @Field(() => Float)
  total: number
}
