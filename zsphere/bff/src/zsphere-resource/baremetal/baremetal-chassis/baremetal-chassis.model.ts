import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { BaremetalChassisState, BaremetalChassisStatus } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { Zone } from '@/hardware-resource/zone/zone.model'

export enum BaremetalChassisPowerStatusType {
  'Unknown' = 'Unknown',
  'PowerOn' = 'PowerOn',
  'PowerOff' = 'PowerOff',
  'Reboot' = 'Reboot',
  'Rebooting' = 'Rebooting'
}

registerEnumType(BaremetalChassisPowerStatusType, {
  name: 'BaremetalChassisPowerStatusType'
})

@ObjectType()
export class BaremetalChassisHardwareInfo {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  type: string

  @Field(() => String)
  content: string

  @Field(() => String)
  chassisUuid: string

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class BaremetalInstanceForBaremetalChassis {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => BaremetalChassisState, { nullable: true })
  state?: BaremetalChassisState
}

@ObjectType()
export class BaremetalChassis {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String)
  ipmiAddress: string

  @Field(() => Int, { nullable: true })
  ipmiPort?: number

  @Field(() => String)
  ipmiUsername: string

  @Field(() => String, { nullable: true })
  ipmiPassword?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid: string

  @Field(() => Cluster)
  cluster: Cluster

  @Field(() => Zone)
  zone: Zone

  @Field(() => String, { nullable: true })
  pxeServerUuid?: string

  @Field(() => BaremetalChassisState, { nullable: true })
  state?: BaremetalChassisState

  @Field(() => BaremetalChassisStatus, { nullable: true })
  status?: BaremetalChassisStatus

  @Field(() => BaremetalChassisPowerStatusType)
  powerStatus: BaremetalChassisPowerStatusType

  @Field(() => [BaremetalChassisHardwareInfo])
  hardwareInfos: Array<BaremetalChassisHardwareInfo>

  @Field(() => BaremetalInstanceForBaremetalChassis, {
    nullable: true,
    description: '裸金属实例'
  })
  baremetalInstance?: BaremetalInstanceForBaremetalChassis

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class BaremetalChassisQueryResp extends QueryCommonResponse(BaremetalChassis) {}

@ObjectType()
export class BaremetalChassisDiskInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  size: string
}

@ObjectType()
export class BaremetalChassisDiskInfoQueryResp extends QueryCommonResponse(
  BaremetalChassisDiskInfo
) {}

@ObjectType()
export class BaremetalChassisNicInfo {
  @Field(() => String)
  devname: string

  @Field(() => String)
  mac: string

  @Field(() => String)
  pxe: string

  @Field(() => String)
  speed: string

  @Field(() => String)
  ip: string
}

@ObjectType()
export class BaremetalChassisNicInfoQueryResp extends QueryCommonResponse(
  BaremetalChassisNicInfo
) {}
