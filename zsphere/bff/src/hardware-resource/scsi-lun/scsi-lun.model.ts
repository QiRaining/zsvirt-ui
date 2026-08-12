import {
  ObjectType,
  Field,
  Float,
  InputType,
  registerEnumType,
  ArgsType,
  Int
} from '@nestjs/graphql'

import { LunSource } from '@/common/enum/common'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

export enum ScsiLunQueryType {
  Normal = 'Normal',
  GetScsiLunCandidatesForAttachingVm = 'GetScsiLunCandidatesForAttachingVm',
  GetScsiLunCandidatesForAttachingZSVInstanceByHost = 'GetScsiLunCandidatesForAttachingZSVInstanceByHost',
  GetScsiLunCandidatesForAttachingZSVInstanceByCluster = 'GetScsiLunCandidatesForAttachingZSVInstanceByCluster',
  GetSharedBlockCandidate = 'GetSharedBlockCandidate'
}

registerEnumType(ScsiLunQueryType, {
  name: 'ScsiLunQueryType'
})

@ArgsType()
export class QueryScsiLunArgs extends QueryAction {
  @Field(() => ScsiLunQueryType, { nullable: true })
  declare type?: ScsiLunQueryType

  @Field(() => String, { nullable: true, defaultValue: 'name' })
  declare sortBy?: string
}

@ObjectType()
export class ScsiLunVmInstanceRefInventory {
  @Field(() => Float, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  scsiLunUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => Float, { nullable: true })
  deviceId?: number

  @Field(() => Boolean, { defaultValue: false })
  attachMultipath: boolean

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ScsiLunHostRefInventory {
  @Field(() => Float, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  scsiLunUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ScsiLun {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  wwid?: string

  @Field(() => String, { nullable: true })
  vendor?: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String, { nullable: true })
  wwn?: string

  @Field(() => String, { nullable: true })
  serial?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  path?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  healthState?: string

  @Field(() => Float, { defaultValue: 0 })
  size: number

  @Field(() => String, { nullable: true })
  multipathDeviceUuid?: string

  @Field(() => [ScsiLunHostRefInventory], { defaultValue: [] })
  scsiLunHostRefs: ScsiLunHostRefInventory[]

  @Field(() => [ScsiLunVmInstanceRefInventory], { defaultValue: [] })
  scsiLunVmInstanceRefs: ScsiLunVmInstanceRefInventory[]

  @Field(() => LunSource, { nullable: true })
  source?: LunSource

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class ScsiLunList {
  @Field(() => [ScsiLun], { defaultValue: [] })
  list?: ScsiLun[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateScsiLunInput {
  @Field(() => [String])
  uuids: string[]
}

@ObjectType()
export class LunDeviceMultiPathDetail {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  disk?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true, description: '值为 active, enabled' })
  status?: string

  @Field(() => String, { nullable: true })
  target?: string
}

@ObjectType()
export class LunDeviceMultiPathList {
  @Field(() => [LunDeviceMultiPathDetail], { defaultValue: [] })
  list: LunDeviceMultiPathDetail[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
