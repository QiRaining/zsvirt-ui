import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

// ========== Enums ==========

export enum MigrationServiceStatus {
  Uploading = 'Uploading',
  UploadFailed = 'UploadFailed',
  Uploaded = 'Uploaded',
  Installing = 'Installing',
  Installed = 'Installed',
  InstallFailed = 'InstallFailed',
  Running = 'Running',
  Upgrading = 'Upgrading',
  Upgraded = 'Upgraded',
  UpgradePackageUploadFailed = 'UpgradePackageUploadFailed',
  UpgradePackageUploaded = 'UpgradePackageUploaded',
  UpgradeExecuteFailed = 'UpgradeExecuteFailed'
}

registerEnumType(MigrationServiceStatus, {
  name: 'MigrationServiceStatus',
  description: '迁移服务状态'
})

export enum GatewayVmState {
  Created = 'Created',
  Starting = 'Starting',
  Running = 'Running',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Migrating = 'Migrating',
  Pausing = 'Pausing',
  Paused = 'Paused',
  Resuming = 'Resuming',
  Rebooting = 'Rebooting',
  Destroying = 'Destroying',
  Destroyed = 'Destroyed',
  Unknown = 'Unknown'
}

registerEnumType(GatewayVmState, {
  name: 'GatewayVmState',
  description: '网关虚拟机状态'
})

// ========== Query: getMigrationServicePackage ==========

@ObjectType()
export class MigrationServicePackage {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => String, { nullable: true })
  gatewayImageUuid?: string

  @Field(() => String, { nullable: true })
  linuxBootImageUuid?: string

  @Field(() => String, { nullable: true })
  windowsBootImageUuid?: string
}

// ========== Query: getZMigrateInfos (迁移概览) ==========

@ObjectType()
export class UpgradeTaskInfo {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => String, { nullable: true })
  status?: string
}

@ObjectType()
export class ZMigrateGlobalConfig {
  @Field(() => String, {
    nullable: true,
    description: 'base64-encoded password of ssh user on gateway'
  })
  gatewaySshPassword?: string

  @Field(() => String, {
    nullable: true,
    description: 'uuid of platform region'
  })
  platformRegionUuid?: string

  @Field(() => String, {
    nullable: true,
    description: 'uuid of platform account'
  })
  platformAccountUuid?: string
}

@ObjectType()
export class FirstGatewayVmInfo {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => Float, { nullable: true })
  storageSize?: number

  @Field(() => String, { nullable: true })
  defaultIp?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string
}

@ObjectType()
export class MigrationServiceInfo {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => Int, { nullable: true })
  platformCount?: number

  @Field(() => Int, { nullable: true })
  gatewayCount?: number

  @Field(() => Int, { nullable: true })
  taskCount?: number

  @Field(() => String, { nullable: true })
  startTime?: string

  @Field(() => Boolean, { nullable: true })
  hasRunningTask?: boolean

  @Field(() => Boolean, { nullable: true })
  vddkUploaded?: boolean

  @Field(() => [UpgradeTaskInfo], { nullable: true })
  upgradeTasks?: UpgradeTaskInfo[]

  @Field(() => ZMigrateGlobalConfig, {
    nullable: true,
    description: 'zmigrate category global configs'
  })
  globalConfigs?: ZMigrateGlobalConfig

  @Field(() => String, {
    nullable: true,
    description: 'IP of the zmigrate gateway host VM'
  })
  gatewayHostIp?: string

  @Field(() => FirstGatewayVmInfo, {
    nullable: true,
    description: '最先创建的网关虚拟机配置信息'
  })
  firstGatewayVm?: FirstGatewayVmInfo
}

// ========== Query: getZMigrateRuntimeConfig (轻量, 供 zmigrate micro-app 启动用) ==========
// 区别于 getZMigrateInfos 的 5 个 Promise.allSettled 调用（含慢查询 GetZMigrateGatewayVmInstances
// 和 QueryLongJob），这里只跑 status / globalConfigs / gatewayHostIp 这 3 个轻量调用，
// 让 zmigrate 子应用可以更快拿到运行时配置启动。

@ObjectType()
export class ZMigrateRuntimeConfig {
  @Field(() => String, {
    nullable: true,
    description: 'IP of the zmigrate gateway host VM'
  })
  gatewayHostIp?: string

  @Field(() => ZMigrateGlobalConfig, { nullable: true })
  globalConfigs?: ZMigrateGlobalConfig

  @Field(() => String, {
    nullable: true,
    description:
      'ZSV Java MN Server address (e.g. http://host:8080), read from ZS_MN_SERVER env var'
  })
  zsMnServer?: string
}

// ========== Query: getZMigrateGatewayVmInstances (服务管理) ==========

@ObjectType()
export class GatewayVmInstance {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => Int, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => Float, { nullable: true })
  storageSize?: number

  @Field(() => String, { nullable: true })
  defaultIp?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => Boolean, {
    nullable: true,
    description: '是否为第一个创建的迁移网关虚拟机（不支持启用/停用/删除）'
  })
  isFirstGateway?: boolean
}

@ObjectType()
export class QueryGatewayVmInstanceResp extends QueryCommonResponse(GatewayVmInstance) {}
