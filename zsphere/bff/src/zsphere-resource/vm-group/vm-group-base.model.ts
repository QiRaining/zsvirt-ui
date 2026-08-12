import { Field, Float, ObjectType } from '@nestjs/graphql'

import { Zone } from '@/hardware-resource/zone/zone.model'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'

import { VmSchedulingRule } from '../vm-scheduling-rule/vm-scheduling-rule.model'

@ObjectType()
export class VmGroupBase {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true, description: '资源的详细描述' })
  description?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Zone, { nullable: true })
  zone?: Zone

  @Field(() => Float, {
    description: '当前云主机调度组拥有的云主机数量',
    nullable: true,
    defaultValue: 0
  })
  vmCount?: number

  @Field(() => Float, {
    description: '当前云主机调度组关联的云主机调度策略数量',
    nullable: true,
    defaultValue: 0
  })
  vmSchedulingRuleCount?: number

  @Field(() => [VmSchedulingRule], {
    description: '当前云主机调度组关联的云主机调度策略数量',
    nullable: true,
    defaultValue: []
  })
  associatedVmSchedulingRuleList?: VmSchedulingRule[]

  @Field(() => CommonOwner, { nullable: true })
  owner?: CommonOwner

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
