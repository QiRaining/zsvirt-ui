import { Field, Int, ObjectType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { AccountOwner } from '@/zsphere-administration/owner/owner.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'

@ObjectType()
export class MonitorGroupResource {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => L3Network, { nullable: true })
  l3Network: L3Network
}

@ObjectType()
export class GroupAction {
  @Field(() => String, { nullable: true })
  groupUuid: string

  @Field(() => String)
  actionType: string

  @Field(() => String)
  actionUuid: string
}
@ObjectType()
export class MonitorGroupInstance {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  instanceUuid: string

  @Field(() => String, { nullable: true })
  status: string

  @Field(() => MonitorGroupResource, { nullable: true })
  instance: MonitorGroupResource

  @Field(() => String)
  groupUuid: string

  @Field(() => String)
  instanceResourceType: string

  @Field(() => String, { nullable: true })
  accountUuid: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class MonitorGroupInstanceList {
  @Field(() => [MonitorGroupInstance])
  list: MonitorGroupInstance[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class InstanceStatistics {
  @Field(() => Int, { nullable: true })
  instanceTotal: number

  @Field(() => Int, { nullable: true })
  instanceTypeCount: number

  @Field(() => Int, { nullable: true })
  unhealthyInstanceCount: number
}

@ObjectType()
export class MonitorGroupTemplateRef {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  groupUuid?: string

  @Field(() => String, { nullable: true })
  templateUuid?: string

  @Field(() => Boolean, { nullable: true })
  isApplied?: boolean

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class MonitorGroup {
  @Field(() => String, { description: '资源的UUID，唯一标示该资源' })
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { nullable: true, description: '资源的详细描述' })
  description: string

  // @Field(() => MonitorTemplate, { nullable: true })
  // monitorTemplate: MonitorTemplate

  @Field(() => Int, { nullable: true })
  resourceTypeCount: number

  @Field(() => Int, { nullable: true })
  totalResourceCount: number

  @Field(() => Int, { nullable: true })
  unhealthResourceCount: number

  @Field(() => InstanceStatistics, { nullable: true })
  instanceStatistics: InstanceStatistics

  @Field(() => AccountOwner, { nullable: true })
  owner: AccountOwner

  @Field(() => [Tag], { defaultValue: [] })
  tag?: Tag[]

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string

  @Field(() => [GroupAction], { nullable: true })
  actions: GroupAction[]

  @Field(() => [MonitorGroupTemplateRef], { nullable: true })
  monitorGroupTemplateRefs?: MonitorGroupTemplateRef[]
}

@ObjectType()
export class MonitorGroupList {
  @Field(() => [MonitorGroup])
  list: MonitorGroup[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class MonitorGroupAddResourceList {
  @Field(() => [MonitorGroupResource])
  list: MonitorGroupResource[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
