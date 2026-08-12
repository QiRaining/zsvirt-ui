import { Field, ObjectType, Int } from '@nestjs/graphql'

import { BaremetalInstanceState, BaremetalInstanceStatus, ImagePlatform } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { Zone } from '@/hardware-resource/zone/zone.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { CommonOwner } from '@/zsphere-administration/owner/owner.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'
import { BaremetalChassis } from '@/zsphere-resource/baremetal/baremetal-chassis/baremetal-chassis.model'
import { BaremetalPxeServer } from '@/zsphere-resource/baremetal/baremetal-pxe-server/baremetal-pxe-server.model'
import { Image } from '@/zsphere-resource/image/image.model'

@ObjectType()
export class BaremetalNic {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => Boolean, { nullable: true })
  pxe?: boolean

  @Field(() => String, { nullable: true })
  baremetalInstanceUuid?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => L3Network, { nullable: true })
  l3Network?: L3Network

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class BaremetalDisk {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  size?: string
}

@ObjectType()
export class BaremetalInstanceConfigSummary {
  @Field(() => Int, { nullable: true })
  disk?: number

  @Field(() => Int, { nullable: true })
  nic?: number
}

@ObjectType()
export class HardwareInfo {
  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Int, { nullable: true })
  memory?: number

  @Field(() => String, { nullable: true })
  cpuModel?: string
}

@ObjectType()
export class BaremetalInstance extends ResourceWithAttributes {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => BaremetalInstanceState, { nullable: true })
  state?: BaremetalInstanceState

  @Field(() => BaremetalInstanceStatus, { nullable: true })
  status?: BaremetalInstanceStatus

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  templateUuid?: string

  @Field(() => ImagePlatform, { nullable: true })
  platform?: ImagePlatform

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  managementIp?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => Cluster, { nullable: true })
  cluster?: Cluster

  @Field(() => String, { nullable: true })
  pxeServerUuid?: string

  @Field(() => BaremetalPxeServer, { nullable: true })
  baremetalPxeServer?: BaremetalPxeServer

  @Field(() => String, { nullable: true })
  chassisUuid?: string

  @Field(() => BaremetalChassis, { nullable: true })
  baremetalChassis?: BaremetalChassis

  @Field(() => HardwareInfo, { nullable: true })
  hardwareInfo?: HardwareInfo

  @Field(() => [BaremetalNic], { nullable: true })
  bmNics: BaremetalNic[]

  @Field(() => [Tag], { defaultValue: [] })
  tag?: Tag[]

  @Field(() => CommonOwner, { nullable: true })
  owner?: CommonOwner

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => Image, { nullable: true })
  image?: Image

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => Zone, { nullable: true })
  zone: Zone

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class BaremetalInstanceList extends QueryCommonResponse(BaremetalInstance) {}

@ObjectType()
export class BaremetalNicList extends QueryCommonResponse(BaremetalNic) {}

@ObjectType()
export class BaremetalDiskList extends QueryCommonResponse(BaremetalDisk) {}
