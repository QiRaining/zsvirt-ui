import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { EmergencyLevel } from '@/common/enum'
import { QueryAction, QueryCommonResponse } from '@/common/model/action-query.model'

import { ThirdpartyPlatform } from '../zwatch-thirdparty-platform/zwatch-thirdparty-platform.model'

export enum ThirdPartyAlertsQueryType {
  Normal = 'Normal',
  AlarmRecord = 'AlarmRecord',
  EndpointRecord = 'EndpointRecord',
  ZCEX = 'ZCEX'
}

registerEnumType(ThirdPartyAlertsQueryType, {
  name: 'ThirdPartyAlertsQueryType'
})

@ObjectType()
export class ThirdPartyAlerts {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  alertTime: string

  @Field(() => EmergencyLevel)
  alertLevel: EmergencyLevel

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  dataSource: string

  @Field(() => String, { nullable: true })
  message: string

  @Field(() => String, { nullable: true })
  metric: string

  @Field(() => String, { nullable: true })
  product: string

  @Field(() => String, { nullable: true })
  readStatus: string

  @Field(() => String, { nullable: true })
  service: string

  @Field(() => String, { nullable: true })
  sourceText: string

  @Field(() => String, { nullable: true })
  thirdpartyPlatformUuid: string

  @Field(() => ThirdpartyPlatform, { nullable: true })
  thirdpartyPlatform: ThirdpartyPlatform
}

@ObjectType()
export class QueryThirdPartyAlertsResp extends QueryCommonResponse(ThirdPartyAlerts) {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  unreadCount?: number
}

@ArgsType()
export class QueryThirdPartyAlertsArgs extends QueryAction {
  @Field(() => ThirdPartyAlertsQueryType, { nullable: true })
  declare type?: ThirdPartyAlertsQueryType
}

@ObjectType()
export class ThirdPartyAlarmSummary {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  emergent?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  important?: number

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  normal?: number
}
