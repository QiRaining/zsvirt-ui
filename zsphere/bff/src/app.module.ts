import { join } from 'path'

import { ApolloDriver } from '@nestjs/apollo'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ScheduleModule } from '@nestjs/schedule'
import { SequelizeModule } from '@nestjs/sequelize'
import { ServeStaticModule } from '@nestjs/serve-static'

import { MaintenanceModule } from '@/maintenance/maintenance.module'
import { ModelModule, models } from '@/model/module'

import { ApiInspectorModule } from './api-inspector/api-inspector.module'
//框架部分
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoggingForApiInspectorPlugin } from './base/logger-for-api-inspector-plugin'
import { LoggingPlugin } from './base/logger-plugin'
import { FlowModule } from './common/flow/flow.module'
import { LoggerModule } from './common/logger/logger.module'
import { MetricDataModule } from './common/metric-data/metric-data.module'
import { applyMocksToSchema } from './common/mock'
import { CondtionValueScalar } from './common/model/action-query.model'
import { NginxModule } from './common/nginx/nginx.module'
import { PUBLIC_DIR } from './common/paths'
import { PubSubService } from './common/pub-sub/pub-sub.service'
import { RecordActionModule } from './common/record-action/record-action.module'
import { ResourceQueryModule } from './common/resource-query/resource-query.module'
import { TaskProgressQueryModule } from './common/task-progress/task-progress-query.module'
import { TransModule } from './common/trans/trans.module'
import { UIPrivilegeModule } from './common/ui-privilege/ui-privilege.module'
import { UIPrivilegeService } from './common/ui-privilege/ui-privilege.service'
import { ZsKvModule } from './common/zs-kv/zs-kv.module'
import { CronService } from './cron/cron.service'
import { ZopsCronService } from './cron/zops-cron.service'
import { CubeModule } from './cube/cube.module'
import { FuzzyQueryModule } from './fuzzy-query/fuzzy-query.module'
import { GlobalModule } from './global/global.module'
import { HardwareResourceModule } from './hardware-resource/hardware-resource.module'
//业务模块
import { IdentityModule } from './identity/identity.module'
import { InspectionActionModule } from './maintenance/inspection/action/_module'
import { NetworkResourceModule } from './network-resource/network-resource.module'
import { NodeIDController } from './nodeid.controller'
import { PrivilegeModule } from './privilege/privilege.module'
import { ResourceRelationsModule } from './resource-relations/resource-relations.module'
import { SearchModule } from './search/search.module'
import { SettingsModule } from './settings/settings.module'
import { UIEnvModule } from './ui-env/ui-env.module'
import { UploadSessionModule } from './upload-session/upload-session.module'
import { Decrypt, isEncrypted } from './utils/aesCipher'
import { ZOpsModule } from './zops/zops.module'
//zsphere 业务
import { AdministrationModule } from './zsphere-administration/administration.module'
import { DashboardModule } from './zsphere-dashboard/dashboard.module'
import { DataProtectionModule } from './zsphere-data-protection/module'
import { MonitoringOMModule } from './zsphere-monitoring-om/module'
import { ReliabilityModule } from './zsphere-reliability/module'
import { VirtualResourceModule } from './zsphere-resource/virtual-resource.module'

import { AdvancedModule } from './zstack-cloud-code/advanced.module'
import { CloudDataProtectionModule } from './zstack-cloud-code/crypto-compliance/data-protection/data-protection.module'

// (xgao) TODO:
// CronService 会自动启动干扰 e2e 测试。
// 所以在这里通过这种方式添加。
// 以后要找个更优雅的方式来处理。
const providers: any = [
  AppService,
  LoggingPlugin,
  PubSubService,
  UIPrivilegeService
]
providers.push(CronService)
// 巡检依赖zops服务
providers.push(ZopsCronService)

if (process.env.GRAPHQL_LOG === 'true') {
  providers.push(LoggingPlugin)
}
if (process.env.NODE_ENV !== 'test') {
  providers.push(CronService)
}
@Module({
  imports: [
    // 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true
    }),
    // 静态目录
    ServeStaticModule.forRoot({
      serveRoot: '/public',
      rootPath: PUBLIC_DIR
    }),
    // 配置 GraphQL
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      path: '/graphql',
      subscriptions: {
        'graphql-ws': true
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
      playground: process.env.NODE_ENV === 'production' ? false : true,
      introspection: process.env.ZSV_MOCK === '1',
      resolvers: {
        CondtionValue: CondtionValueScalar
      },
      transformSchema: process.env.ZSV_MOCK === '1' ? applyMocksToSchema : undefined
    }),

    SequelizeModule.forRoot(
      process.env.ZSV_MOCK === '1'
        ? {
            dialect: 'sqlite',
            storage: ':memory:',
            models,
            autoLoadModels: true,
            synchronize: true,
            logging: false,
            define: {
              freezeTableName: true,
              timestamps: false
            }
          }
        : {
            dialect: 'mysql',
            host: process.env.ZS_MYSQL_HOST,
            port: parseInt(process.env.ZS_MYSQL_PORT),
            username: process.env.ZS_MYSQL_USERNAME,
            password: isEncrypted(process.env.ZS_MYSQL_PASSWORD)
              ? Decrypt(process.env.ZS_MYSQL_PASSWORD)
              : process.env.ZS_MYSQL_PASSWORD,
            database: 'zstack_ui',
            logging: false,
            define: {
              charset: 'utf8',
              collate: 'utf8_general_ci',
              freezeTableName: true, // 这个要设置，不然每次都要在表名后面加 s
              timestamps: false // 必须要关闭，不然每次都要去查 createAt
            },
            pool: {
              // 这里添加了 pool 配置
              max: 20, // 最大连接数
              min: 0, // 最小连接数
              acquire: 60000, // 获取连接的最大时间
              idle: 10000 // 连接最大空闲时间
            },
            models
          }
    ),
    GlobalModule,
    PrivilegeModule,
    ZsKvModule,
    ScheduleModule.forRoot(),
    ModelModule,
    TransModule,
    MetricDataModule,
    ResourceQueryModule,
    TaskProgressQueryModule,
    RecordActionModule,
    IdentityModule,

    //zsphere
    VirtualResourceModule,
    DashboardModule,
    ReliabilityModule,
    DataProtectionModule,
    MonitoringOMModule,
    AdministrationModule,

    HardwareResourceModule,
    MaintenanceModule,
    AdvancedModule,

    SettingsModule,
    // NetworkServiceModule,
    NetworkResourceModule,
    CloudDataProtectionModule,
    SearchModule,
    HttpModule,
    CubeModule,
    InspectionActionModule,
    FuzzyQueryModule,
    UIEnvModule,
    UploadSessionModule,
    ZOpsModule,
    FlowModule,
    NginxModule,
    UIPrivilegeModule,

    ResourceRelationsModule,

    LoggerModule.forRoot(),

    ...(process.env.API_INSPECTOR === 'true' ? [ApiInspectorModule] : [])
  ],
  controllers: [AppController, NodeIDController],
  providers:
    process.env.API_INSPECTOR === 'true' ? [...providers, LoggingForApiInspectorPlugin] : providers
})
export class AppModule {}
