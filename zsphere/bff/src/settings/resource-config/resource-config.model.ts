import { ObjectType, Field, registerEnumType } from '@nestjs/graphql'

import { GlobalConfig } from '@/settings/global-config/global-config.model'

export enum DependentResourceType {
  ClusterVO = 'ClusterVO',
  PrimaryStorageVO = 'PrimaryStorageVO',
  L3NetworkVO = 'L3NetworkVO',
  VmInstanceVO = 'VmInstanceVO',
  GlobalConfig = 'GlobalConfig',
  BackupStorageVO = 'BackupStorageVO'
}

registerEnumType(DependentResourceType, {
  name: 'DependentResourceType'
})

@ObjectType()
export class ResourceConfig extends GlobalConfig {
  @Field(() => String, { nullable: true, description: '资源类型' })
  resourceType?: string

  @Field(() => String)
  resourceUuid: string

  @Field(() => String)
  declare uuid: string
}

@ObjectType()
export class ResourceConfigInPage extends ResourceConfig {
  @Field(() => String)
  globalConfigValue: string

  @Field(() => DependentResourceType, {
    nullable: true,
    defaultValue: DependentResourceType.GlobalConfig,
    description: '默认参考全局配置, 用于标记该配置所依赖资源的资源类型。'
  })
  dependentResourceType?: DependentResourceType
}

@ObjectType()
export class ResourceConfigList {
  @Field(() => [ResourceConfigInPage], { nullable: true })
  list?: ResourceConfigInPage[]
}
