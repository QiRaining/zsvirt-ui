import { Field, Int, ObjectType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'
import { ActionSendResp } from '@/common/model/action-send-resp.model'

@ObjectType()
export class Zone {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDefault: boolean

  @Field(() => Int, { nullable: true })
  clusterCount?: number

  @Field(() => Int, { nullable: true })
  primaryStorageCount?: number

  @Field(() => Int, { nullable: true })
  l2NetworkCount?: number

  @Field(() => Int, { nullable: true })
  vmInstanceCount?: number

  @Field(() => Int, { nullable: true })
  volumeCount?: number

  @Field(() => Int, { nullable: true })
  backupStorageCount?: number

  @Field(() => Int, { nullable: true })
  hostCount?: number
}
@ObjectType()
export class VirtualizationZoneRelatedSummary {
  @Field(() => Int, { nullable: true })
  virInstanceCount?: number

  @Field(() => Int, { nullable: true })
  virPrimaryStorageCount?: number

  @Field(() => Int, { nullable: true })
  virClusterCount?: number

  @Field(() => Int, { nullable: true })
  virHostCount?: number

  @Field(() => Int, { nullable: true })
  virImageStoreCount?: number

  @Field(() => Int, { nullable: true })
  virL2NetworkCount?: number

  @Field(() => Int, { nullable: true })
  virL3NetworkCount?: number
}

@ObjectType()
export class ZoneResponse {
  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => [Zone])
  list: Zone[]
}

@ObjectType()
export class ZoneActionResp {
  @Field(() => ActionSendResp, { nullable: true })
  result?: ActionSendResp

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class ZoneRelatedSummary {
  @Field(() => Int)
  clusterTotal: number

  @Field(() => Int)
  baremetalClusterTotal: number

  @Field(() => Int)
  baremetal2ClusterTotal: number

  @Field(() => Int)
  primaryStorageTotal: number

  @Field(() => Int)
  l2NetworkTotal: number

  @Field(() => Int)
  backupStorageTotal: number
}
