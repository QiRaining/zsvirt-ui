import { Field, Float, ObjectType, ArgsType, Int } from '@nestjs/graphql'

import { EmergencyLevel } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { QueryAction } from '@/common/model/action-query.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { Owner } from '@/zsphere-resource/image/image.model'

@ObjectType()
export class EventHistoriesLabel {
  @Field(() => String, { nullable: true })
  FaultMountPoint: string

  @Field(() => String, { nullable: true })
  NewStatus: string

  @Field(() => String, { nullable: true })
  OldStatus: string

  @Field(() => String, { nullable: true })
  Error: string

  @Field(() => String, { nullable: true })
  ManagementNodeIP: string

  @Field(() => String, { nullable: true })
  DestinationHostUuid: string
}

@ObjectType()
export class ResourceInAlarmHistories {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  tagType: string

  @Field(() => [Tag], { nullable: true })
  tags: Tag[]
}

@ObjectType()
export class AckDataInAlarmHistories {
  @Field(() => String, { nullable: true })
  ackPeriod?: string

  @Field(() => String, { nullable: true })
  ackDate?: string

  @Field(() => String, { nullable: true })
  operatorAccountUuid?: string

  @Field(() => Owner, { nullable: true })
  owner?: Owner

  @Field(() => Boolean, { nullable: true })
  resumeAlert?: boolean
}

@ObjectType()
export class AlarmSummary {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  emergent?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  important?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  normal?: number
}
@ObjectType()
export class AlarmHistories {
  @Field(() => String, { nullable: true })
  accountUuid?: string

  @Field(() => String, { nullable: true })
  alarmName?: string

  @Field(() => String, { nullable: true })
  alarmZhName?: string

  @Field(() => String, { nullable: true })
  alarmStatus?: string

  @Field(() => String, { nullable: true })
  alarmUuid?: string

  @Field(() => String, { nullable: true })
  subscriptionUuid?: string

  @Field(() => String, { nullable: true })
  comparisonOperator?: string

  @Field(() => String, { nullable: true })
  context?: string

  @Field(() => String)
  dataUuid: string

  @Field(() => String)
  uuid: string

  @Field(() => EmergencyLevel, { nullable: true })
  emergencyLevel: EmergencyLevel

  @Field(() => String, { nullable: true })
  labels?: string

  @Field(() => String, { nullable: true })
  error?: string

  @Field(() => Boolean, { nullable: true })
  canLink?: boolean

  @Field(() => String, { nullable: true })
  metricName?: string

  @Field(() => String, { nullable: true })
  metricValue?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  namespace?: string

  @Field(() => String, { nullable: true })
  period?: string

  @Field(() => Boolean, { nullable: true })
  readStatus?: boolean

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  threshold?: string

  @Field(() => String, { nullable: true })
  firstTime?: string

  @Field(() => String, { nullable: true })
  createTime?: string

  @Field(() => Int, { nullable: true })
  times?: number

  @Field(() => ResourceInAlarmHistories, { nullable: true })
  resource?: ResourceInAlarmHistories

  @Field(() => AckDataInAlarmHistories, { nullable: true })
  ackData?: AckDataInAlarmHistories

  @Field(() => String, {
    nullable: true,
    description: '报警器类型 alarm | event'
  })
  type?: string

  @Field(() => String, { nullable: true })
  operatorAccountUuid?: string

  @Field(() => Owner, { nullable: true })
  operatorAccount?: Owner

  @Field(() => Boolean, { nullable: true })
  isGatewayVm?: boolean
}

@ObjectType()
export class QueryAlarmHistoriesResp extends QueryCommonResponse(AlarmHistories) {
  @Field(() => Int, { nullable: true })
  unreadCount?: number
}

@ObjectType()
export class CountByNamespaceInventory {
  @Field(() => String, { nullable: true })
  namespace?: string

  @Field(() => Int, { nullable: true })
  count?: number
}

@ObjectType()
export class GetCountByNamespaceResp extends QueryCommonResponse(CountByNamespaceInventory) {}

@ArgsType()
export class QueryAlarmHistoriesArgs extends QueryAction {
  @Field(() => Float, { description: '开始时间', nullable: true })
  startTime?: number

  @Field(() => Float, { description: '结束时间', nullable: true })
  endTime?: number

  @Field(() => String, { description: '接收端 UUID', nullable: true })
  endpointUuid?: string
}
