import { ArgsType, Field, InputType, ObjectType, registerEnumType, Int } from '@nestjs/graphql'

/**
 * ManagementNetwork 管理网
 * TenantNetwork 业务网
 * StorageNetwork 存储网
 * BackupNetwork 备份网
 * MigrationNetwork 迁移网
 */
export enum PhysicalNetworkType {
  ManagementNetwork = 'ManagementNetwork',
  TenantNetwork = 'TenantNetwork',
  StorageNetwork = 'StorageNetwork',
  BackupNetwork = 'BackupNetwork',
  MigrationNetwork = 'MigrationNetwork'
}
registerEnumType(PhysicalNetworkType, {
  name: 'PhysicalNetworkType'
})

@InputType()
export class GetPhysicalNetworkRelatedSummaryInput {}

@ObjectType()
export class PhysicalNetworkRelatedSummary {
  @Field(() => Int)
  managementNetworkCount: number

  @Field(() => Int)
  storageNetworkCount: number

  @Field(() => Int)
  tenantNetworkCount: number

  @Field(() => Int)
  backupNetworkCount: number

  @Field(() => Int)
  migrationNetworkCount: number
}

@ArgsType()
@ObjectType()
export class GetInterfaceServiceRelatedSummaryArgs {
  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string
}

@ObjectType()
export class InterfaceServiceRelatedSummary extends PhysicalNetworkRelatedSummary {}

@ArgsType()
@ObjectType()
export class GetInterfaceRelatedSummaryArgs {
  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => PhysicalNetworkType, { nullable: true })
  serviceType?: PhysicalNetworkType

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string
}

@ObjectType()
export class InterfaceRelatedSummary {
  @Field(() => Int)
  interfaceInterfaceServiceCount: number

  @Field(() => Int)
  bondingInterfaceServiceCount: number
}
