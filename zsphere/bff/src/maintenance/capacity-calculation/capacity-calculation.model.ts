import { ArgsType, Field, Float, ObjectType } from '@nestjs/graphql'

@ArgsType()
@ObjectType({ description: '什么都不传的时候表示拿全平台的数据' })
export class QueryHostCpuMemoryCapacityArgs {
  @Field(() => [String], { nullable: true, defaultValue: [] })
  zoneUuids?: string[]

  @Field(() => [String], { nullable: true, defaultValue: [] })
  clusterUuids?: string[]

  @Field(() => [String], { nullable: true, defaultValue: [] })
  hostUuids?: string[]
}

@ObjectType()
export class HostCpuMemoryCapacity {
  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description: '物理机UUID'
  })
  hostUuids: string[]

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总内存（虚拟）'
  })
  totalMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用内存（虚拟）'
  })
  availableMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '超分总量。超分率X总量'
  })
  overProvisioningTotalMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '可用总量（超分后的）。超分率X可用总量'
  })
  overProvisioningAvailableMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 1.0,
    description: '内存超分率，这里默认随机取一个host的内存超分率！！！'
  })
  overProvisioningMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '保留内存（虚拟）'
  })
  reservedMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '保留内存（物理）'
  })
  reservedPhysicalMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总内存（物理）'
  })
  totalPhysicalMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用内存（物理）'
  })
  availablePhysicalMemory?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description:
      '总可用CPU(超分后，availableCpu = cpuNum * 超分率。超分配置如下：name: cpu.overProvisioning.ratio，category: host)'
  })
  totalCpu?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用CPU(超分后)'
  })
  availableCpu?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'CPU核数'
  })
  cpuNum?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'CPU插槽数'
  })
  cpuSockets?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'CPU 总赫兹 '
  })
  totalCpuGHz?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'CPU使用率, 平均值'
  })
  CPUAllUsedUtilization?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '内存使用百分比, 平均值'
  })
  MemoryUsedInPercent?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '可用内存(byte), 总和'
  })
  MemoryFreeBytes?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '已用内存(byte), 总和'
  })
  MemoryUsedBytes?: number

  @Field(() => Float, {
    nullable: true,
    description: '更新时间'
  })
  timestamp?: number
}

@ArgsType()
@ObjectType({ description: '什么都不传的时候表示拿全平台的数据' })
export class QueryPrimaryStorageCapacityArgs {
  @Field(() => [String], { nullable: true, defaultValue: [] })
  zoneUuids?: string[]

  @Field(() => [String], { nullable: true, defaultValue: [] })
  primaryStorageUuids?: string[]
}

@ObjectType()
export class PrimaryStorageCapacity {
  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description: '主存储UUID'
  })
  primaryStorageUuids: string[]

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用容量（虚拟）'
  })
  availableCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 1.0,
    description:
      '存储超分率，这里默认随机取一个PrimaryStorage的超分率！！！，name=overProvisioning.primaryStorage category=mevoco'
  })
  overProvisioningPrimaryStorage?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '存储使用率阈值'
  })
  thresholdPrimaryStoragePhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总保留容量，需要通过全局配置category=primaryStorage name=reservedCapacity来计算'
  })
  reservedCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量（虚拟）'
  })
  totalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用容量（物理）'
  })
  availablePhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description:
      '总保留容量（物理），需要通过全局配置name=threshold.primaryStorage.physicalCapacity category=mevoco来计算'
  })
  reservedPhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量（物理）'
  })
  totalPhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '系统使用容量'
  })
  systemUsedCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '快照容量'
  })
  volumeSnapshotSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '镜像缓存'
  })
  imageCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘'
  })
  volumeSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘真实容量'
  })
  volumeActualSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '模版缓存'
  })
  vmTemplateVolumeCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    description: '更新时间'
  })
  timestamp?: number
}

@ArgsType()
@ObjectType({ description: 'hostUuid 必传' })
export class QueryLocalStorageHostCapacityArgs {
  @Field(() => String)
  hostUuid: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string
}

@ObjectType()
export class LocalStorageHostCapacity {
  @Field(() => String, {
    nullable: true,
    description: '物理机UUID'
  })
  hostUuid: string

  @Field(() => String, {
    nullable: true,
    description: '主存储UUID'
  })
  primaryStorageUuid?: string

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用容量（虚拟）'
  })
  availableCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总保留容量，需要通过全局配置category=primaryStorage name=reservedCapacity来计算'
  })
  reservedCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 1.0,
    description:
      '存储超分率，这里默认随机取一个Host的超分率！！！，name=overProvisioning.primaryStorage category=mevoco'
  })
  overProvisioningPrimaryStorage?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量（虚拟）'
  })
  totalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总可用容量（物理）'
  })
  availablePhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description:
      '总保留容量（物理），需要通过全局配置name=threshold.primaryStorage.physicalCapacity category=mevoco来计算'
  })
  reservedPhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量（物理）'
  })
  totalPhysicalCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0
  })
  systemUsedCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '快照容量'
  })
  volumeSnapshotSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '镜像缓存'
  })
  imageCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘'
  })
  volumeSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘真实容量'
  })
  volumeActualSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '模版缓存'
  })
  vmTemplateVolumeCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    description: '更新时间'
  })
  timestamp?: number
}

//ceph
@ObjectType()
export class CephPrimaryStoragePoolCapacity {
  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '快照容量'
  })
  volumeSnapshotSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '镜像缓存'
  })
  imageCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘'
  })
  volumeSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '虚拟机硬盘真实容量'
  })
  volumeActualSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '模版缓存'
  })
  vmTemplateVolumeCacheSize?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '保留容量(这个保留容量只用于ceph的pool池)'
  })
  reservedCapacity?: number
}

// vhost
@ObjectType()
export class ExternalPrimaryStoragePoolCapacity extends CephPrimaryStoragePoolCapacity {}

// zbs
@ObjectType()
export class CBDPrimaryStoragePoolCapacity extends CephPrimaryStoragePoolCapacity {}
