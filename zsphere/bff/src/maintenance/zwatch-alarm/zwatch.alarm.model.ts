import {
  Field,
  ObjectType,
  Float,
  Int,
  registerEnumType,
  ArgsType,
  OmitType
} from '@nestjs/graphql'

import { AlarmStatus, AlarmState, EmergencyLevel } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { BasicOwner } from '@/zsphere-administration/owner/owner.model'
import { UserTag } from '@/zsphere-administration/tag/tag.model'

import { ThirdpartyPlatform } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.model'

@ObjectType()
export class AlarmLabels {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  key: string

  @Field(() => String, { nullable: true })
  operator: string

  @Field(() => String, { nullable: true })
  value: string
}

@ObjectType()
export class AlarmActions {
  @Field(() => String, { nullable: true })
  alarmUuid: string

  @Field(() => String, { nullable: true })
  subscriptionUuid: string

  @Field(() => String, { nullable: true })
  actionType: string

  @Field(() => String, { nullable: true })
  actionUuid: string
}

@ObjectType()
export class Alarm {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  zhName?: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  comparisonOperator: string

  @Field(() => Float, { nullable: true })
  period: number

  @Field(() => String, { nullable: true })
  namespace: string

  @Field(() => String, { nullable: true })
  metricName: string

  @Field(() => Float, { nullable: true })
  threshold: number

  @Field(() => EmergencyLevel, { nullable: true })
  emergencyLevel: EmergencyLevel

  @Field(() => Boolean, { nullable: true })
  enableRecovery: boolean

  @Field(() => String, { nullable: true })
  eventName: string

  @Field(() => Float, { nullable: true })
  repeatCount: number

  @Field(() => Float, { nullable: true })
  repeatInterval: number

  @Field(() => AlarmStatus, { nullable: true })
  status: AlarmStatus

  @Field(() => AlarmState, { nullable: true })
  state: AlarmState

  @Field(() => [AlarmLabels], { nullable: true })
  labels: AlarmLabels[]

  @Field(() => [AlarmActions], { nullable: true })
  actions: AlarmActions[]
}

@ObjectType()
export class ZWatchAlarmVO extends Alarm {
  @Field(() => Int, { nullable: true })
  topicNum: number

  @Field(() => UserTag, { nullable: true })
  userTag: UserTag

  @Field(() => BasicOwner, { nullable: true })
  owner: BasicOwner

  @Field(() => ThirdpartyPlatform, { nullable: true })
  platform: ThirdpartyPlatform

  @Field(() => String, { nullable: true })
  thirdpartyPlatformName: string

  @Field(() => Int, {
    nullable: true,
    description: '报警器关联的虚拟机 ，过滤模板虚拟机/模板缓存/已删除状态的虚拟机后的数量'
  })
  filteredAlarmResourceCount?: number
}

@ObjectType()
export class ZWatchAlarmVoResp extends QueryCommonResponse(ZWatchAlarmVO) {}

@ObjectType()
export class ZWatchAlarmActionResp {
  @Field(() => ZWatchAlarmVO, { nullable: true })
  result?: ZWatchAlarmVO

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export enum ZWatchAlarmQueryType {
  Resource = 'Resource',
  Event = 'Event',
  Thirdparty = 'Thirdparty',
  MonitorGroupResource = 'MonitorGroupResource',
  MonitorGroupEvent = 'MonitorGroupEvent',
  ZwatchEndpoint = 'ZwatchEndpoint',
  //---zsv
  ZCEX = 'ZCEX'
}
registerEnumType(ZWatchAlarmQueryType, {
  name: 'ZWatchAlarmQueryType'
})

@ArgsType()
export class QueryZWatchAlarmArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => ZWatchAlarmQueryType, { nullable: true })
  type?: ZWatchAlarmQueryType
}

@ArgsType()
export class QueryMetricLabelListArgs {
  @Field(() => String)
  namespace: string

  @Field(() => String)
  metricName: string

  @Field(() => [String])
  labelNames: string[]

  @Field(() => String, { nullable: true })
  filterLabels?: string
}

@ObjectType()
export class MetricLabel {
  @Field(() => String, { nullable: true })
  VMUuid?: string

  @Field(() => String, { nullable: true })
  BaremetalVMUuid?: string

  @Field(() => String, { nullable: true })
  Baremetal2VMUuid?: string

  @Field(() => String, { nullable: true })
  HostUuid?: string

  @Field(() => String, { nullable: true })
  CPUNum?: string

  @Field(() => String, { nullable: true })
  DiskDeviceLetter?: string

  @Field(() => String, { nullable: true })
  NetworkDeviceLetter?: string

  @Field(() => String, { nullable: true })
  MountPoint?: string

  @Field(() => String, { nullable: true })
  InterfaceName?: string
}

@ObjectType()
export class MetricLabelResp {
  @Field(() => [MetricLabel])
  labels: MetricLabel[]
}
