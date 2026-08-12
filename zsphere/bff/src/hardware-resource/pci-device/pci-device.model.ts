import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PickType,
  registerEnumType
} from '@nestjs/graphql'

import { PciDeviceState, PciDeviceStatus } from '@/common/enum'
import { PciDeviceType } from '@/common/enum/zstack'
import {
  QueryAction as IQueryAction,
  QueryAction,
  QueryCommonResponse
} from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { PciDeviceSpec as IPciDeviceSpec } from '@/zsphere-resource/pci-device-spec/pci-device-spec.model'
import { VmInstanceBase } from '@/zsphere-resource/vm-instance/vm-instance-base.model'

import { Bond } from '../bond/bond.model'
import { ReadyState } from '../disk/disk.model'
import { HostVO } from '../host/host.model'
import { PhysicalNetworkType } from '../physical-network/physical-network.model'

export enum PciDeviceVirtStatus {
  UNVIRTUALIZABLE = 'UNVIRTUALIZABLE',
  SRIOV_VIRTUALIZABLE = 'SRIOV_VIRTUALIZABLE',
  VFIO_MDEV_VIRTUALIZABLE = 'VFIO_MDEV_VIRTUALIZABLE',
  SRIOV_VIRTUALIZED = 'SRIOV_VIRTUALIZED',
  VFIO_MDEV_VIRTUALIZED = 'VFIO_MDEV_VIRTUALIZED',
  SRIOV_VIRTUAL = 'SRIOV_VIRTUAL',
  UNKNOWN = 'UNKNOWN'
}
registerEnumType(PciDeviceVirtStatus, {
  name: 'PciDeviceVirtStatus'
})

export enum ELLDPMode {
  rx_only = 'rx_only',
  tx_only = 'tx_only',
  rx_and_tx = 'rx_and_tx',
  disable = 'disable'
}

export enum PciDeviceMetaDataOperator {
  Equal = 'Equal',
  Unequal = 'Unequal'
}

registerEnumType(PciDeviceMetaDataOperator, {
  name: 'PciDeviceMetaDataOperator'
})

registerEnumType(ELLDPMode, {
  name: 'ELLDPMode'
})

export enum NicState {
  UP = 'UP',
  DOWN = 'DOWN'
}
registerEnumType(NicState, {
  name: 'NicState'
})

export enum PciDevicePassThroughState {
  Available = 'Available',
  Disabled = 'Disabled',
  Enabled = 'Enabled'
}

registerEnumType(PciDevicePassThroughState, {
  name: 'PciDevicePassThroughState'
})

@ObjectType()
class PciDeviceMetaDataEntries {
  @Field(() => String)
  key: string

  @Field(() => String)
  value: string

  @Field(() => PciDeviceMetaDataOperator)
  op: string
}

@ObjectType()
class PciDeviceMetaData {
  @Field(() => String)
  metaData: string

  @Field(() => [PciDeviceMetaDataEntries])
  metaDataEntries: [PciDeviceMetaDataEntries]
}

@ObjectType()
class HostNetworkInterface {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => Boolean, { nullable: true })
  carrierActive: boolean

  @Field(() => String, { nullable: true })
  interfaceName: string

  @Field(() => Float, { nullable: true })
  speed: number

  @Field(() => String, { nullable: true })
  offloadStatus?: string

  @Field(() => String, { nullable: true })
  hostUuid: string

  @Field(() => NicState, { nullable: true })
  state: NicState

  @Field(() => ReadyState, { nullable: true })
  readyState: ReadyState
}

@ObjectType()
class CanDirectRestore {
  @Field(() => Boolean, { nullable: true })
  canDirectRestore: boolean

  @Field(() => [String], { nullable: true })
  vmUuidList: string[]
}

@ObjectType()
class VfAvailableNum {
  @Field(() => Int, { nullable: true })
  vfAvailableNum: number

  @Field(() => Int, { nullable: true })
  vfTotalNum: number
}

@ObjectType()
export class MatchedPciDeviceOfferingRef {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  pciDeviceOfferingUuid: string
}

@ObjectType()
export class MdevSpecRefs {
  @Field(() => String)
  pciDeviceUuid: string

  @Field(() => String)
  mdevSpecUuid: string

  @Field(() => Boolean)
  effective: boolean

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class HostInPciDevice {
  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  status: string

  @Field(() => String, { nullable: true })
  managementIp: string

  @Field(() => String, { nullable: true })
  cluster: string

  @Field(() => String, { nullable: true })
  clusterUuid: string
}

@ObjectType()
export class PciDeviceSpecInPciDevice extends PickType(
  IPciDeviceSpec,
  ['name', 'uuid'],
  ObjectType
) {}

/**
 * 网卡lldp模式信息
 */
@ObjectType()
export class LLDPMode {
  @Field(() => String)
  uuid: string

  @Field(() => ELLDPMode, { nullable: true })
  mode?: ELLDPMode

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class PhysicalNicLLDPDevice {
  @Field(() => String)
  lldpUuid: string

  @Field(() => String)
  chassisId: string

  @Field(() => Float)
  timeToLive: number

  @Field(() => String, { nullable: true })
  managementAddress?: string

  @Field(() => String)
  systemName: string

  @Field(() => String)
  systemDescription: string

  @Field(() => String)
  systemCapabilities: string

  @Field(() => String)
  portId: string

  @Field(() => String, { nullable: true })
  portDescription?: string

  @Field(() => Float, { nullable: true })
  vlanId?: number

  @Field(() => Float, { nullable: true })
  aggregationPortId?: number

  @Field(() => Int, { nullable: true })
  mtu?: number

  @Field(() => String)
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@InputType()
export class PciDeviceQueryAction extends PickType(
  IQueryAction,
  [
    'conditions',
    'count',
    'fields',
    'groupBy',
    'limit',
    'replyWithCount',
    'sortBy',
    'sortDirection',
    'start'
  ],
  InputType
) {}

export enum PciDeviceGpuType {
  'DesktopGpu' = 'DesktopGpu',
  'ComputeGpu' = 'ComputeGpu'
}

registerEnumType(PciDeviceGpuType, {
  name: 'PciDeviceGpuType'
})

@ObjectType()
export class PciDeviceNameAndUuid {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class PciDevice {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  parentUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  pciSpecUuid?: string

  @Field(() => String, { nullable: true })
  vendorId: string

  @Field(() => String, { nullable: true })
  vendor: string

  @Field(() => String, { nullable: true })
  deviceId: string

  @Field(() => String, { nullable: true })
  subvendorId?: string

  @Field(() => String, { nullable: true })
  subdeviceId?: string

  @Field(() => String, { nullable: true })
  pciDeviceAddress?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => PciDeviceType, { nullable: true })
  type?: PciDeviceType

  @Field(() => PciDeviceState, { nullable: true })
  state?: PciDeviceState

  @Field(() => PciDeviceStatus, { nullable: true })
  status?: PciDeviceStatus

  @Field(() => PciDeviceVirtStatus, { nullable: true })
  virtStatus?: PciDeviceVirtStatus

  @Field(() => PciDeviceMetaData, { nullable: true })
  metaData?: PciDeviceMetaData

  @Field(() => [MatchedPciDeviceOfferingRef], { nullable: true })
  matchedPciDeviceOfferingRef?: [MatchedPciDeviceOfferingRef]

  @Field(() => [MdevSpecRefs], { nullable: true })
  mdevSpecRefs?: MdevSpecRefs[]

  @Field(() => Float, { nullable: true })
  physicalNicDeviceMaxPartNum?: number

  @Field(() => Int, { nullable: true })
  vmCount?: number

  @Field(() => HostInPciDevice, { nullable: true })
  host?: HostInPciDevice

  @Field(() => HostNetworkInterface, { nullable: true })
  hostNetworkInterface?: HostNetworkInterface

  @Field(() => CanDirectRestore, { nullable: true })
  canDirectRestore?: CanDirectRestore

  @Field(() => VfAvailableNum, { nullable: true })
  vfAvailableNum?: VfAvailableNum

  @Field(() => VmInstanceBase, { nullable: true })
  vmInstance?: VmInstanceBase

  @Field(() => VmInstanceBase, { nullable: true })
  templatedVmInstance?: VmInstanceBase

  @Field(() => PciDeviceSpecInPciDevice, { nullable: true })
  pciDeviceSpec?: PciDeviceSpecInPciDevice

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => PciDeviceGpuType, { nullable: true })
  gpuType: PciDeviceGpuType

  @Field(() => PciDevicePassThroughState)
  passThroughState: PciDevicePassThroughState
}

export enum PhysicalNicQueryType {
  Normal = 'Normal',
  getCandidatesPhysicalNicForMultipleCreateBond = 'getCandidatesPhysicalNicForMultipleCreateBond',
  getCandidatesPhysicalNicForSingleCreateOrModifyBond = 'getCandidatesPhysicalNicForSingleCreateOrModifyBond',
  getCandidatesPhysicalNicForCreateByInL2VSwitch = 'getCandidatesPhysicalNicForCreateByInL2VSwitch',
  getCandidatesPhysicalNicForAddToBondInL2VSwitch = 'getCandidatesPhysicalNicForAddToBondInL2VSwitch',
  getCandidatesPhysicalNicForCreateByInVM = 'getCandidatesPhysicalNicForCreateByInVM'
}

registerEnumType(PhysicalNicQueryType, {
  name: 'PhysicalNicQueryType'
})

@ArgsType()
export class QueryPhysicalNicArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => PhysicalNicQueryType, {
    nullable: true,
    defaultValue: PhysicalNicQueryType.Normal
  })
  declare type?: PhysicalNicQueryType
}

@ObjectType()
export class HostNetworkInterfaceServiceRef {
  @Field(() => String)
  interfaceUuid: string

  @Field(() => Int, { nullable: true })
  vlanId?: number

  @Field(() => PhysicalNetworkType, { nullable: true })
  serviceType?: PhysicalNetworkType

  @Field(() => [PhysicalNetworkType], { nullable: true })
  serviceTypes?: PhysicalNetworkType[]

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ArgsType()
export class QueryPhysicalNicLLDPDeviceArgs {
  @Field(() => String)
  hostId: string
  @Field(() => String)
  interfaceUuid: string
  @Field(() => String, { nullable: true })
  lldpUuid?: string
}

@ObjectType()
export class L2NetworkNameAndUuidForPhysicalNic {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@ObjectType()
export class PhysicalNic {
  @Field(() => String, { nullable: true })
  uuid: string

  @Field(() => String, { nullable: true })
  interfaceName: string

  @Field(() => String, { nullable: true })
  interfaceType: string

  @Field(() => String, { nullable: true })
  interfaceFactory: string

  @Field(() => String, { nullable: true })
  interfaceModel: string

  @Field(() => String, { nullable: true })
  bondingUuid: string

  @Field(() => Bond, { nullable: true })
  bond: Bond

  @Field(() => [String], { nullable: true })
  ipAddresses?: string[]

  @Field(() => String, { nullable: true })
  mac: string

  @Field(() => String, { nullable: true })
  pciDeviceAddress: string

  @Field(() => Boolean, { nullable: true })
  carrierActive: boolean

  @Field(() => Boolean, { nullable: true })
  slaveActive: boolean

  @Field(() => Float, { nullable: true })
  speed: number

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  offloadStatus?: string

  @Field(() => ReadyState, { nullable: true })
  readyState: ReadyState

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => HostVO, { nullable: true })
  host?: HostVO

  @Field(() => NicState, { nullable: true })
  state: NicState

  @Field(() => PciDevice, { nullable: true })
  pciDevice: PciDevice

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [HostNetworkInterfaceServiceRef], {
    nullable: true,
    defaultValue: []
  })
  hostNetworkInterfaceServiceRef?: HostNetworkInterfaceServiceRef[]

  @Field(() => Boolean)
  availableVlanIds: boolean

  @Field(() => LLDPMode, { nullable: true })
  lLDPMode?: LLDPMode

  @Field(() => L2NetworkNameAndUuidForPhysicalNic, { nullable: true })
  vSwitch?: L2NetworkNameAndUuidForPhysicalNic
}

@ObjectType()
export class PhysicalNicList extends QueryCommonResponse(PhysicalNic) {}

@ArgsType()
export class PciDeviceQueryParam {
  @Field(() => String)
  type: string

  @Field(() => PciDeviceQueryAction)
  queryParam: PciDeviceQueryAction
}

@ObjectType()
export class PciDeviceList extends QueryCommonResponse(PciDevice) {}

@ObjectType()
export class PciDeviceActionResp {
  @Field(() => PciDevice, { nullable: true })
  result?: PciDevice

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@ObjectType()
export class PhysicalNicCountResp {
  @Field(() => Int, { nullable: true })
  up?: number

  @Field(() => Int, { nullable: true })
  down?: number
}
