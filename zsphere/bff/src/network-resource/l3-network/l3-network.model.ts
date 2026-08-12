import { ArgsType, Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { ResourceWithAttributes } from '@/zsphere-monitoring-om/resource-attribute/resource-attribute.model'

import { IpCapacity, IpRange } from './ip/ip.model'

export enum L3NetworkType {
  'public' = 'public',
  'manage' = 'manage',
  'vpc' = 'vpc',
  'flat' = 'flat',
  'flow' = 'flow'
}

registerEnumType(L3NetworkType, {
  name: 'L3NetworkType'
})

export enum PortGroupVlanMode {
  NONE = 'NONE',
  ACCESS = 'ACCESS',
  TRUNK = 'TRUNK',
  PVLAN = 'PVLAN'
}

registerEnumType(PortGroupVlanMode, {
  name: 'PortGroupVlanMode'
})

export enum L3NetworkQueryType {
  'ZSTACK' = 'ZSTACK',
  'CreateInstance' = 'CreateInstance',
  'CREATE_VM_CANDIDATE' = 'CREATE_VM_CANDIDATE',
  'CREATE_OVF' = 'CREATE_OVF',
  'CREATE_VIP_CANDIDATE' = 'CREATE_VIP_CANDIDATE',
  'CREATE_EIP_CANDIDATE' = 'CREATE_EIP_CANDIDATE',
  'QueryVpcNetwork' = 'QueryVpcNetwork',
  'CreateIPsecCandidate' = 'CreateIPsecCandidate',
  'CreateAutoScalingGroupCandidate' = 'CreateAutoScalingGroupCandidate',
  'CreateVirtualRouterOfferingManageNetwork' = 'CreateVirtualRouterOfferingManageNetwork',
  'CreateVirtualRouterOfferingL3Network' = 'CreateVirtualRouterOfferingL3Network',
  'NetFlowAddVpcRouterCandidate' = 'NetFlowAddVpcRouterCandidate',
  'OspfAddVpcRouterCandidate' = 'OspfAddVpcRouterCandidate',
  'VpcFirewallBindL3Network' = 'VpcFirewallBindL3Network',
  'AttachVmNicCandiate' = 'AttachVmNicCandiate',
  'Shared_Resource_Flat_Network' = 'Shared_Resource_Flat_Network',
  'Shared_Resource_Public_Network' = 'Shared_Resource_Public_Network',
  'Shared_Resource_VPC_Network' = 'Shared_Resource_VPC_Network',
  'Mine_Resource_Network' = 'Mine_Resource_Network',
  'IpsecConnectionLocalCidrAttachCandidate' = 'IpsecConnectionLocalCidrAttachCandidate',
  'RecoverRootVolumeBackupCandidate' = 'RecoverRootVolumeBackupCandidate',
  'Shared_Resource_Network' = 'Shared_Resource_Network',
  'SetIPAddress' = 'SetIPAddress',
  'ZSV_Shared_Resource_Flat_Network' = 'ZSV_Shared_Resource_Flat_Network',
  'ZSV_NOT_Shared_Resource_Flat_Network' = 'ZSV_NOT_Shared_Resource_Flat_Network'
}

registerEnumType(L3NetworkQueryType, {
  name: 'L3NetworkQueryType'
})

@ObjectType()
export class VirtualRouterOfferingNameAndUuid {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string
}

@ObjectType()
export class NetworkServiceProvider {
  @Field(() => [String], { nullable: true })
  attachedL2NetworkUuids?: string[]

  @Field(() => [String], { nullable: true })
  networkServiceTypes?: string[]

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string
}

@ObjectType()
export class NetworkServices {
  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  networkServiceProviderUuid?: string

  @Field(() => String, { nullable: true })
  networkServiceType?: string

  @Field(() => NetworkServiceProvider, { nullable: true })
  networkServiceProvider?: NetworkServiceProvider
}

@ObjectType()
export class GetFreeIpOfL3NetworkResult {
  @Field(() => [String], { nullable: true })
  ipv4List: string[]

  @Field(() => [String], { nullable: true })
  ipv6List: string[]
}

@ObjectType()
export class DhcpIp {
  @Field(() => String, { nullable: true })
  ipv4?: string

  @Field(() => String, { nullable: true })
  ipv6?: string
}

@ObjectType()
export class L3Owner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  linkedAccountUuid: string

  @Field(() => String)
  type: string
}

@ObjectType()
export class L3VpcVRouter {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string
}

@ObjectType()
export class VPortGroup {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  vlanId: string
}

@ObjectType()
export class L2NetworkRef {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  physicalInterface: string

  @Field(() => String, { nullable: true })
  virtualNetworkId: string

  @Field(() => String, { nullable: true })
  vSwitchType?: string

  @Field(() => Boolean, { nullable: true })
  enableSRIOV: boolean

  @Field(() => [String], { nullable: true })
  attachedClusterUuids: string[]
}

@ObjectType()
export class L3Network extends ResourceWithAttributes {
  @Field(() => String)
  uuid: string

  @Field(() => String, { description: 'name' })
  name: string

  @Field(() => String, { description: 'description', nullable: true })
  description: string

  @Field(() => String, { description: '网络类型', nullable: true })
  type: string

  @Field(() => Boolean, { nullable: true })
  enableIPAM?: boolean

  @Field(() => String, { nullable: true })
  hypervisorType: string

  @Field(() => [IpRange], { description: 'IP范围', nullable: true })
  ipRanges: IpRange[]

  @Field(() => String, { description: '创建时间', nullable: true })
  createDate: string

  @Field(() => String, { description: '最后操作时间', nullable: true })
  lastOpDate: string

  @Field(() => Int, { description: 'IP版本', nullable: true })
  ipVersion: number

  @Field(() => String, { description: '类别', nullable: true })
  category: string

  @Field(() => IpCapacity, { description: 'ip可用量', nullable: true })
  ipCapacity: IpCapacity

  @Field(() => Int, { nullable: true })
  usedIpCount?: number

  @Field(() => DhcpIp, { description: 'DHCP服务IP', nullable: true })
  dhcpIp: DhcpIp

  @Field(() => String, { nullable: true })
  ipAllocateStrategy: string

  @Field(() => Int, { description: 'mtu', nullable: true })
  mtu: number

  @Field(() => L3Owner, { description: '资源所有者', nullable: true })
  owner: L3Owner

  @Field(() => [String], { description: 'DNS', nullable: true })
  dns: string[]

  @Field(() => L2NetworkRef, { description: '对应的二层网络', nullable: true })
  l2Network?: L2NetworkRef

  @Field(() => L2NetworkRef, {
    description: '对应的分布式交换机',
    nullable: true
  })
  vSwitch?: L2NetworkRef

  @Field(() => String, { description: '对应的二层网络的uuid', nullable: true })
  l2NetworkUuid?: string

  @Field(() => String, { description: '私有网络接口ip', nullable: true })
  routerInterfaceIp?: string

  @Field(() => String, { description: '三层网络类型判断', nullable: true })
  networkTypeName?: string

  @Field(() => L3NetworkType, {
    description: '三层网络类型判断,前端五种网络',
    nullable: true
  })
  networkType?: L3NetworkType

  @Field(() => Boolean, { description: '是否为系统网络', nullable: true })
  system?: boolean

  @Field(() => Boolean, { description: '是否为流量网络', nullable: true })
  mirrorNetwork?: boolean

  @Field(() => [NetworkServices], {
    description: '网络服务类型',
    nullable: true
  })
  networkServices?: NetworkServices[]

  // @Field(() => () => VirtualRouterOfferingNameAndUuid, { nullable: true })
  // virtualRouterOffering?: VirtualRouterOfferingNameAndUuid

  // @Field(() => String, { nullable: true })
  // virtualRouterOfferingUuid?: string

  @Field(() => L3VpcVRouter, { nullable: true })
  vpcVRouter?: L3VpcVRouter

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => String, { description: 'zone uuid', nullable: true })
  zoneUuid: string

  @Field(() => Boolean, {
    description: 'l2Netwrok.enableSRIOV',
    nullable: true
  })
  enableSRIOV?: boolean

  @Field(() => Boolean, { nullable: true })
  isDefault?: boolean

  @Field(() => VPortGroup, { nullable: true })
  portGroup?: VPortGroup

  @Field(() => Boolean, { nullable: true })
  hasDefaultKernel?: boolean

  @Field(() => String, { nullable: true })
  vSwitchUuid?: string

  @Field(() => Boolean, { nullable: true })
  isForStorageKernel?: boolean
}

@ObjectType()
export class L3NetworkListResp {
  @Field(() => [L3Network])
  list: L3Network[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class Dns {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  dns: string
}

@ObjectType()
export class DnsListResp {
  @Field(() => [Dns])
  list: Dns[]

  @Field(() => Int)
  total: number
}

@ObjectType()
export class L3NetworkCountResp {
  @Field(() => Int)
  total: number
}

@InputType()
export class CreateL3NetworkInputParam {
  @Field(() => String)
  name: string

  @Field(() => String)
  l2NetworkUuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  hideDns?: boolean

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  category?: 'Private' | 'Public' | 'System'

  @Field(() => Boolean, { nullable: true })
  system?: boolean

  @Field(() => String, { nullable: true })
  dnsDomain?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => Boolean, { nullable: true })
  enableIPAM?: boolean

  @Field(() => [String], { nullable: true })
  tagUuids?: any[]

  @Field(() => [String], { nullable: true })
  systemTags?: any[]

  @Field(() => [String], { nullable: true })
  userTags?: any[]

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => Int, { nullable: true })
  prefixLen?: number

  @Field(() => String, { nullable: true })
  addressMode?: string

  @Field(() => String, { nullable: true })
  startIp?: string

  @Field(() => String, { nullable: true })
  endIp?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  ipRangeType?: string

  @Field(() => Int, { nullable: true, defaultValue: 4 })
  ipVersion: 4 | 6 | 46

  // add ip range by cidr
  @Field(() => String, { nullable: true })
  networkCidr?: string

  // DHCP服务IP
  @Field(() => String, { description: 'DHCP服务IP', nullable: true })
  dhcpIp?: string

  // DHCP服务是否开启
  @Field(() => Boolean, { description: 'DHCP服务是否开启', nullable: true })
  dhcpService?: boolean

  @Field(() => String, { nullable: true })
  ipAllocateStrategy?: string

  // 用于区别创建时的类型，判断应该挂载哪些网络服务
  @Field(() => String, {
    nullable: true,
    description: '用于区别创建时的类型，判断应该挂载哪些网络服务'
  })
  showNetworkServiceType?: string

  // add dns
  @Field(() => String, { nullable: true })
  dns?: string

  // virtualrouteroffering
  @Field(() => String, { nullable: true })
  virtualRouterOfferingUuid?: string

  // vpcVRouter
  @Field(() => String, { nullable: true })
  vpcVRouterUuid?: string

  // 私有网络接口IP 仅当网络类型为路由器且添加网络段方法不为cidr时需要手动设置
  @Field(() => String, { nullable: true })
  routerInterfaceIp?: string

  @Field(() => Number, {
    nullable: true,
    description: '分布式端口组创建时使用，用于CreateL2PortGroup'
  })
  vlan?: number

  @Field(() => PortGroupVlanMode, {
    nullable: true
  })
  vlanMode?: PortGroupVlanMode
}

@InputType()
export class AddDnsToL3NetworkParams {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => String, { nullable: true })
  dns: string
}

@InputType()
export class RemoveDnsFromL3NetworkParams {
  @Field(() => String, { nullable: true })
  l3NetworkUuid: string

  @Field(() => [String], { nullable: true })
  dns: string[]
}

@InputType()
export class AttachVirtualRouterOfferingParams {
  @Field(() => String)
  l3NetworkUuid: string

  @Field(() => String)
  vRouterOfferingUuid: string

  @Field(() => String, { nullable: true })
  resourceType: 'L3NetworkVO'
}

@ArgsType()
export class QueryL3NetworkArgs extends QueryAction {
  @Field(() => L3NetworkQueryType, { nullable: true })
  declare type?: L3NetworkQueryType
}

// for protGroup vlanid validate
@ArgsType()
export class ValidateVlanIdArgs {
  @Field(() => String)
  vlanId: string

  @Field(() => String)
  vSwitchUuid: string
}

@ObjectType()
export class ValidateVlanIdResp {
  @Field(() => Boolean)
  result: boolean
}
