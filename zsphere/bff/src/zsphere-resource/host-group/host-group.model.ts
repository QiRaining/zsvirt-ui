import { Int, Field, ArgsType, ObjectType, Float, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'

import { VmSchedulingRule } from '../vm-scheduling-rule/vm-scheduling-rule.model'

export enum HostGroupQueryType {
  Normal = 'Normal'
}

registerEnumType(HostGroupQueryType, {
  name: 'HostGroupQueryType'
})

@ObjectType()
export class HostGroup {
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

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Float, {
    description: '当前物理机调度组拥有的物理机数量',
    nullable: true,
    defaultValue: 0
  })
  hostCount?: number

  @Field(() => [VmSchedulingRule], {
    description: '当前物理机调度组关联的云主机调度策略数量',
    nullable: true,
    defaultValue: []
  })
  associatedVmSchedulingRuleList?: VmSchedulingRule[]

  @Field(() => Float, {
    description: '当前物理机调度组关联的物理机调度策略数量',
    nullable: true,
    defaultValue: 0
  })
  vmSchedulingRuleCount?: number

  @Field(() => Cluster, { nullable: true })
  cluster?: Cluster

  @Field(() => CommonOwner, { nullable: true })
  owner?: CommonOwner
}

@ObjectType()
export class HostGroupList {
  @Field(() => [HostGroup])
  list: HostGroup[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ArgsType()
export class QueryHostGroupArgs extends QueryAction {
  @Field(() => HostGroupQueryType, { nullable: true })
  declare type?: HostGroupQueryType
}

@ObjectType()
export class HostGroupActionResp {
  @Field(() => HostGroup, { nullable: true })
  result?: HostGroup

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
