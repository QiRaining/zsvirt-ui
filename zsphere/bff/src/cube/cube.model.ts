import { ObjectType, Field, ArgsType, Int, Float } from '@nestjs/graphql'

@ObjectType()
export class EnvInfo {
  @Field(() => Boolean)
  isCube: boolean

  @Field(() => String, { nullable: true })
  storageType?: string

  @Field(() => String, { nullable: true })
  version?: string
}

@ObjectType()
export class NodeInfo {
  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => Int, { nullable: true })
  port?: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  sn?: string

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Boolean, { nullable: true })
  isManagementNode?: boolean
}

@ObjectType()
export class TenantNetwork {
  @Field(() => String, { nullable: true })
  start_ip?: string

  @Field(() => String, { nullable: true })
  end_ip?: string

  @Field(() => String, { nullable: true })
  netmask?: string

  @Field(() => String, { nullable: true })
  gateway?: string

  @Field(() => String, { nullable: true })
  vlan_id?: string

  @Field(() => String, { nullable: true })
  bond_mode?: string

  @Field(() => String, { nullable: true })
  xmit_hash_policy?: string
}

@ObjectType()
export class StorageInfo {
  @Field(() => [NodeInfo], { nullable: true })
  monList?: NodeInfo[]

  @Field(() => [NodeInfo], { nullable: true })
  mdsList?: NodeInfo[]

  @Field(() => String, { nullable: true })
  poolName?: string

  @Field(() => String, { nullable: true })
  storageType?: string
}

@ObjectType()
export class WizardInfo {
  @Field(() => [NodeInfo])
  hostList: NodeInfo[]

  @Field(() => String, { nullable: true })
  storageClusterNetwork?: string

  @Field(() => StorageInfo, { nullable: true })
  storageInfo?: StorageInfo

  @Field(() => String, { nullable: true })
  storagePublicNetwork?: string

  @Field(() => TenantNetwork, { nullable: true })
  tenantNetwork?: TenantNetwork
}

@ObjectType()
export class DeployedNodeDisk {
  @Field(() => String)
  sn: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Int, { nullable: true })
  size?: number

  @Field(() => String, { nullable: true })
  productName?: string

  @Field(() => String, { nullable: true })
  type?: string
}

@ObjectType()
export class DeployedNode {
  @Field(() => String)
  sn: string

  @Field(() => String, { nullable: true })
  model?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => String, { nullable: true })
  storageClusterIp?: string

  @Field(() => String, { nullable: true })
  storagePublicIp?: string

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => [DeployedNodeDisk], { nullable: true })
  disk?: DeployedNodeDisk[]
}

@ObjectType()
export class BootstrapInfo {
  @Field(() => Boolean, { nullable: true })
  active?: boolean

  @Field(() => [DeployedNode], { nullable: true })
  nodes?: DeployedNode[]
}

@ObjectType()
export class SdsInfo {
  @Field(() => String, { nullable: true })
  sdsVersion?: string

  @Field(() => Boolean, { nullable: true })
  isExpandPoolSupported?: boolean
}

@ArgsType()
export class GetSdsInfoArgs {
  @Field(() => String)
  monitorNodeIp: string
}
