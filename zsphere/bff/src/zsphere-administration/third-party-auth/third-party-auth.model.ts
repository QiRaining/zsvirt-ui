import { Field, ObjectType, Int, InputType, registerEnumType } from '@nestjs/graphql'

import { CreateActionResp } from '@/common/model/action-resp.model'

export enum LdapServerType {
  OpenLdap = 'OpenLdap',
  WindowsAD = 'WindowsAD',
  Unknown = 'Unknown'
}
registerEnumType(LdapServerType, { name: 'LdapServerType' })

@ObjectType()
export class ThirdPartyAuth {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  url?: string

  @Field(() => String, { nullable: true })
  base?: string

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  password?: string

  @Field(() => String, { nullable: true })
  encryption?: string

  @Field(() => LdapServerType, { nullable: true })
  serverType?: LdapServerType

  @Field(() => String, { nullable: true })
  filter?: string

  @Field(() => String, { nullable: true })
  usernameProperty?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class ThirdPartyAuthVirtualIDSyncConfig {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  fullname?: string

  @Field(() => String, { nullable: true })
  phone?: string

  @Field(() => String, { nullable: true })
  mail?: string

  @Field(() => String, { nullable: true })
  identifier?: string

  @Field(() => String, { nullable: true })
  description?: string
}

@ObjectType()
export class ThirdPartyAuthOrgSyncConfig {
  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  strategy?: string
}

@ObjectType()
export class ThirdPartyAuthUserDefinedSyncConifg {
  @Field(() => String, { nullable: true })
  key?: string

  @Field(() => String, { nullable: true })
  value?: string
}

@ObjectType()
export class ThirdPartyAuthSystemTag {
  @Field(() => String, { nullable: true })
  ldapCleanBindingFilter?: string

  @Field(() => String, { nullable: true })
  ldapCleanBindingFilterUuid?: string

  @Field(() => String, { nullable: true })
  ldapAllowListFilter?: string

  @Field(() => String, { nullable: true })
  ldapAllowListFilterUuid?: string

  @Field(() => String, { nullable: true })
  ldapServerType?: string

  @Field(() => String, { nullable: true })
  ldapServerTypeUuid?: string

  @Field(() => String, { nullable: true })
  ldapUseAsLoginName?: string

  @Field(() => String, { nullable: true })
  ldapUseAsLoginNameUuid?: string

  @Field(() => ThirdPartyAuthVirtualIDSyncConfig, { nullable: true })
  virtualIDSyncConfiguration?: ThirdPartyAuthVirtualIDSyncConfig

  @Field(() => String, { nullable: true })
  virtualIDSyncConfigurationUuid?: string

  @Field(() => ThirdPartyAuthOrgSyncConfig, { nullable: true })
  organizationSyncConfiguration?: ThirdPartyAuthOrgSyncConfig

  @Field(() => String, { nullable: true })
  organizationSyncConfigurationUuid?: string

  @Field(() => String, { nullable: true })
  standbyServerIP?: string

  @Field(() => String, { nullable: true })
  standbyServerPort?: string

  @Field(() => String, { nullable: true })
  ldapUrlsUuid?: string

  @Field(() => [ThirdPartyAuthUserDefinedSyncConifg], { nullable: true })
  userDefinedSyncConifgProps?: ThirdPartyAuthUserDefinedSyncConifg[]
}

@ObjectType()
export class ThirdPartyAuthResourceref {
  @Field(() => Int, { nullable: true })
  userCount?: number

  @Field(() => Int, { nullable: true })
  orgCount?: number
}

@ObjectType()
export class ThirdPartyAuthResourceConfig {
  @Field(() => String, { nullable: true })
  autoSync?: string

  @Field(() => String, { nullable: true })
  autoSyncUuid?: string

  @Field(() => String, { nullable: true })
  syncInterval?: string

  @Field(() => String, { nullable: true })
  syncIntervalUuid?: string
}

@ObjectType()
export class ThirdPartyAuthVO extends ThirdPartyAuth {
  @Field(() => ThirdPartyAuthSystemTag, { nullable: true })
  relatedSystemTag: ThirdPartyAuthSystemTag

  @Field(() => ThirdPartyAuthResourceref, { nullable: true })
  bindResourceref: ThirdPartyAuthResourceref

  @Field(() => ThirdPartyAuthResourceConfig, { nullable: true })
  resourceConfig: ThirdPartyAuthResourceConfig
}

@InputType()
export class UpdateThirdPartyAuthInput {
  @Field(() => String)
  ldapServerUuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  url: string

  @Field(() => String, { nullable: true })
  base: string

  @Field(() => String, { nullable: true })
  username: string

  @Field(() => String, { nullable: true })
  password: string

  @Field(() => String, { nullable: true })
  description: string
}

@ObjectType()
export class ThirdPartyAuthResp {
  @Field(() => [ThirdPartyAuthVO])
  list: ThirdPartyAuthVO[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ObjectType()
export class ThirdPartyAuthActionResp extends CreateActionResp(ThirdPartyAuthVO) {}
