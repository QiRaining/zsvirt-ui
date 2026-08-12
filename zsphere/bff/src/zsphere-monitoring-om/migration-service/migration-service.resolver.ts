import { Inject } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

import {
  MigrationServicePackage,
  MigrationServiceInfo,
  ZMigrateRuntimeConfig,
  GatewayVmInstance,
  QueryGatewayVmInstanceResp
} from './migration-service.model'
import { MigrationServiceService } from './migration-service.service'

@Resolver(() => MigrationServicePackage)
export class MigrationServicePackageResolver {
  @Inject() migrationServiceService: MigrationServiceService

  @Query(() => MigrationServicePackage, { nullable: true })
  async getMigrationServicePackage(): Promise<MigrationServicePackage | null> {
    return this.migrationServiceService.getMigrationServicePackage()
  }
}

@Resolver(() => MigrationServiceInfo)
export class MigrationServiceInfoResolver {
  @Inject() migrationServiceService: MigrationServiceService

  @Query(() => MigrationServiceInfo, { nullable: true })
  async getZMigrateInfos(): Promise<MigrationServiceInfo | null> {
    return this.migrationServiceService.getZMigrateInfos()
  }

  @Query(() => Boolean)
  getZMigrateVddkUploaded(): Promise<boolean> {
    return this.migrationServiceService.getZMigrateVddkUploaded()
  }
}

@Resolver(() => ZMigrateRuntimeConfig)
export class ZMigrateRuntimeConfigResolver {
  @Inject() migrationServiceService: MigrationServiceService

  // 轻量 query: 仅返回 zmigrate 子应用启动需要的运行时配置，
  // 不跑 GetZMigrateGatewayVmInstances / QueryLongJob 等慢查询。
  @Query(() => ZMigrateRuntimeConfig, { nullable: true })
  async getZMigrateRuntimeConfig(): Promise<ZMigrateRuntimeConfig | null> {
    return this.migrationServiceService.getZMigrateRuntimeConfig()
  }
}

@Resolver(() => GatewayVmInstance)
export class GatewayVmInstanceResolver {
  @Inject() migrationServiceService: MigrationServiceService

  @Query(() => QueryGatewayVmInstanceResp)
  async gatewayVmInstanceList(@Args() params: QueryAction): Promise<QueryGatewayVmInstanceResp> {
    return this.migrationServiceService.queryGatewayVmList(params)
  }
}
