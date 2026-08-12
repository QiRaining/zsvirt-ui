import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'

import { MetricParam } from '@/common/metric-data/metric-data.model'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { L3Network } from '@/network-resource/l3-network/l3-network.model'
import { Eip } from '@/network-service/eip/eip.model'
import { SecurityGroup } from '@/network-service/security-group/security-group.model'

import { VmInstanceBase } from '../vm-instance/vm-instance-base.model'

@ObjectType()
export class VmNicResourceConfig {
  @Field(() => Int, { nullable: true })
  nicMultiQueueNum?: number
}

@ObjectType()
export class UsedIp {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true, description: 'IP段UUID' })
  ipRangeUuid?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => L3Network, { nullable: true })
  l3Network?: L3Network

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  usedFor?: string

  @Field(() => Int, { nullable: true })
  ipInLong?: number

  @Field(() => String, { nullable: true })
  vmNicUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

export enum NicType {
  Bond = 'Bond',
  Nic = 'Nic'
}

registerEnumType(NicType, { name: 'NicType' })

export enum VmNicSecurityPolicyEnum {
  ALLOW = 'ALLOW',
  DENY = 'DENY'
}

registerEnumType(VmNicSecurityPolicyEnum, { name: 'VmNicSecurityPolicyEnum' })

@ObjectType()
export class VmNicSecurityPolicy {
  @Field(() => VmNicSecurityPolicyEnum, { nullable: true })
  ingressPolicy?: VmNicSecurityPolicyEnum

  @Field(() => VmNicSecurityPolicyEnum, { nullable: true })
  egressPolicy?: VmNicSecurityPolicyEnum
}

@ObjectType()
export class NicDevice {
  @Field(() => NicType, { nullable: true })
  type?: NicType

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class VmNicBandWidth {
  @Field(() => Float, { nullable: true })
  inboundBandwidth?: number

  @Field(() => Float, { nullable: true })
  outboundBandwidth?: number
}

@ObjectType()
export class TemplateVmInstanceForVmNic {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class VmNic {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  networkUuid?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  metaData?: string

  @Field(() => Int, { nullable: true })
  ipVersion?: number

  @Field(() => String, { nullable: true })
  driverType?: string

  @Field(() => [UsedIp], { nullable: true })
  usedIps?: UsedIp[]

  @Field(() => Int, { nullable: true })
  deviceId?: number

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  internalName?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => Boolean, { nullable: true })
  isPxe?: boolean

  @Field(() => VmNicBandWidth, { nullable: true })
  nicBandWidth?: VmNicBandWidth

  @Field(() => L3Network, { nullable: true })
  l3Network?: L3Network

  @Field(() => Boolean, { nullable: true })
  snat?: boolean

  @Field(() => VmInstanceBase, { nullable: true })
  vmInstance?: VmInstanceBase

  @Field(() => TemplateVmInstanceForVmNic, { nullable: true })
  templatedVmInstance?: TemplateVmInstanceForVmNic

  @Field(() => [Eip], { nullable: true })
  eip?: Eip[]

  @Field(() => Boolean, { nullable: true })
  isBindPortMirrorSession?: boolean

  @Field(() => [SecurityGroup], { nullable: true })
  securityGroup?: SecurityGroup[]

  @Field(() => NicDevice, { nullable: true })
  nicDevice?: NicDevice

  @Field(() => VmNicResourceConfig, { nullable: true })
  resourceConfig?: VmNicResourceConfig

  @Field(() => VmNicSecurityPolicy, { nullable: true })
  securityPolicy?: VmNicSecurityPolicy
}

@ObjectType()
export class VmNicListResp {
  @Field(() => [VmNic])
  list: VmNic[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class VmNicIp {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  mac?: string

  @Field(() => Boolean, { nullable: true })
  isStatic?: boolean

  @Field(() => String, { description: 'vmNicIpUuid' })
  vmNicIpUuid: string

  @Field(() => String, { description: 'vmNicUuid' })
  vmNicUuid: string
}

@ObjectType()
export class VmNicIpListResp {
  @Field(() => [VmNicIp])
  list: VmNicIp[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class NicMetricData {
  @Field(() => Float)
  total: number

  @Field(() => Float)
  average: number

  @Field(() => Float)
  max: number

  @Field(() => Float)
  percent95: number
}

@ObjectType()
export class GetNicMetricDataResp {
  @Field(() => NicMetricData)
  in: NicMetricData

  @Field(() => NicMetricData)
  out: NicMetricData
}

@InputType()
export class AttachL3NetworkToVmParams {
  @Field(() => String, { description: '当前云主机uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: 'l3NetworkUuid' })
  l3NetworkUuid: string
}

@InputType()
export class DeleteNicQoSParams {
  @Field(() => String, { description: '网卡的uuid' })
  uuid: string

  @Field(() => String, { description: '取消的是上行带宽还是下行带宽' })
  direction: 'in' | 'out'
}

@InputType()
export class SetNicQoSParams {
  @Field(() => String, { description: '网卡的uuid' })
  uuid: string

  @Field(() => Float, { description: '上行带宽', nullable: true })
  outboundBandwidth?: number

  @Field(() => Float, { description: '下行带宽', nullable: true })
  inboundBandwidth?: number
}

@InputType()
export class SetVmStaticIpParam {
  @Field(() => String, { description: '当前vm的uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  l3NetworkUuid: string

  @Field(() => String, { description: 'ip' })
  ip: string
}
@InputType()
export class DeleteVmStaticIpParam {
  @Field(() => String, { description: '当前vm的uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '三层网的uuid' })
  l3NetworkUuid: string

  @Field(() => String, { description: 'deleteMode' })
  deleteMode: string
}

@InputType()
export class ChangeVmNicTypeParam {
  @Field(() => String, { description: '网卡Uuid' })
  vmNicUuid: string

  @Field(() => String, { description: '磁盘类型' })
  vmNicType: string
}

@InputType()
export class UpdateVmNicDriverParam {
  @Field(() => String, { description: '云主机Uuid' })
  vmInstanceUuid: string

  @Field(() => String, { description: '网卡Uuid' })
  vmNicUuid: string

  @Field(() => String, { description: '设备型号' })
  driverType: string
}

export enum VmNicQueryType {
  'GetPortForwardingAttachableVmNics' = 'GetPortForwardingAttachableVmNics',
  'CandidateVmNicForSecurityGroup' = 'CandidateVmNicForSecurityGroup',
  'CandidateVmNicForAttachEip' = 'CandidateVmNicForAttachEip',
  'VmNicInSecurityGroup' = 'VmNicInSecurityGroup',
  'PortMirrorCandidateVmNics' = 'PortMirrorCandidateVmNics'
}

registerEnumType(VmNicQueryType, {
  name: 'VmNicQueryType'
})

@ArgsType()
export class QueryVmNicArgs extends QueryAction {
  @Field(() => VmNicQueryType, { nullable: true })
  declare type?: VmNicQueryType
}

@ArgsType()
export class ZQLGetNicMetricDataArgs {
  @Field(() => MetricParam, { description: '多个监控项可以一起查询。' })
  metricParam: Omit<MetricParam, 'metricName'>
}

@ObjectType()
export class VmNicAttachedNetworkServices {
  @Field(() => [String], { nullable: true })
  networkServices?: string[]
}

@InputType()
export class CheckMacAvailabilityParam {
  @Field(() => String)
  mac: string
}

@ObjectType()
export class CheckMacAvailabilityResult {
  @Field(() => Boolean)
  available: boolean
}

@InputType()
export class CheckVNicIpAvailabilityParam {
  @Field(() => Int, { nullable: true, defaultValue: 4 })
  ipVersion?: number

  @Field(() => String, { nullable: true })
  l3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => [String], { nullable: true })
  vmNicUuids?: string[]
}

@ObjectType()
export class CheckVNicAvailabilityResult {
  @Field(() => Boolean)
  available: boolean

  @Field(() => [String])
  duplicateIps: string[]

  @Field(() => [L3Network], { nullable: true })
  l3Network?: L3Network[]
}
