import { Field, Int, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'

import { MonitorGroupTemplateRef } from '../monitor-group/monitor-group.model'

@ObjectType()
export class MonitorTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => ShareType, { nullable: true })
  shareType: ShareType

  @Field(() => Int, { nullable: true })
  monitorGroupNum: number

  @Field(() => Int, { nullable: true })
  ruleTemplateNum: number

  @Field(() => [Tag], { nullable: true })
  tag?: Tag[]

  @Field(() => [MonitorGroupTemplateRef], { nullable: true })
  monitorGroupTemplateRefs?: MonitorGroupTemplateRef[]
}

@ObjectType()
export class QueryMonitorTemplateResp extends QueryCommonResponse(MonitorTemplate) {}
