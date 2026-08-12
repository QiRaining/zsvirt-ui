import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum Identity {
  Admin = 'Admin', // admin (IAM1)
  NormalAccount = 'NormalAccount', // 普通账户 (IAM1)
  AccountNormalUser = 'AccountNormalUser', // 用户 (IAM1) —— 不再维护
  PlatformAdmin = 'PlatformAdmin', // 平台管理员 (IAM2)
  PlatformUser = 'PlatformUser', // 平台用户 (IAM2)
  ProjectAdmin = 'ProjectAdmin', // 项目负责人 (IAM2)
  OrganizationOperator = 'OrganizationOperator', // 运营管理员 (IAM2)
  ProjectOperator = 'ProjectOperator', // 项目管理员 (IAM2)
  ProjectNormalUser = 'ProjectNormalUser', // 普通项目成员 (IAM2)
  IAM2SystemAdmin = 'IAM2SystemAdmin', // 系统管理员 (IAM2)
  IAM2SecurityAdmin = 'IAM2SecurityAdmin', // 安全管理员 (IAM2)
  IAM2AuditAdmin = 'IAM2AuditAdmin', // 审计管理员 (IAM2)
  IAM2DashboardManager = 'IAM2DashboardManager', // 大屏监控 (IAM2)

  // zsv
  VirtualMachineUser = 'VirtualMachineUser', // 虚拟机用户 (IAM1)
  IAM1SystemAdmin = 'IAM1SystemAdmin', // 系统管理员 (IAM1)
  IAM1SecurityAdmin = 'IAM1SecurityAdmin', // 安全管理员 (IAM1)
  IAM1AuditAdmin = 'IAM1AuditAdmin', // 审计管理员 (IAM1)
  IAM1ResourceViewer = 'IAM1ResourceViewer', // 只读角色 (IAM1)
  Other = 'Other' // 其他 (IAM1)
}

registerEnumType(Identity, {
  name: 'Identity'
})

@ObjectType()
export class UserCCSCertificateRefs {
  @Field(() => String, { nullable: true })
  userUuid?: string

  @Field(() => String, { nullable: true })
  certificateUuid?: string

  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class CCSCertificate {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  algorithm?: string

  @Field(() => String, { nullable: true })
  format?: string

  @Field(() => String, { nullable: true })
  issuerDN?: string

  @Field(() => String, { nullable: true })
  subjectDN?: string

  @Field(() => String, { nullable: true })
  serNumber?: string

  @Field(() => String, { nullable: true })
  effectiveTime?: string

  @Field(() => String, { nullable: true })
  expirationTime?: string

  @Field(() => [UserCCSCertificateRefs], { nullable: true })
  userCertificateRefs?: UserCCSCertificateRefs[]

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class LoginResp {
  @Field(() => String)
  sessionId?: string

  @Field(() => String)
  accountUuid?: string

  @Field(() => String, {
    deprecationReason: 'Account sessions no longer have a separate userUuid; use accountUuid.'
  })
  userUuid?: string

  @Field(() => Identity, { nullable: true })
  currentIdentity?: Identity

  @Field(() => CCSCertificate, { nullable: true })
  ccsCertificate?: CCSCertificate
}

@InputType()
export class ClientInfo {
  @Field(() => String, { nullable: true })
  clientIp?: string

  @Field(() => String, { nullable: true })
  clientBrowser?: string
}

@InputType()
export class LoginByAccountInput {
  @Field(() => String)
  accountName: string

  @Field(() => String)
  password: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string

  @Field(() => String, { nullable: true })
  verifyCode?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo
}

@InputType()
export class LogInInput {
  @Field(() => String)
  username: string

  @Field(() => String)
  password: string

  @Field(() => String)
  loginType: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string

  @Field(() => String, { nullable: true })
  verifyCode?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo
}

@InputType()
export class LoginIAM2VirtualIDInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  password: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string

  @Field(() => String, { nullable: true })
  verifyCode?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo
}

@InputType()
export class LoginIAM2ProjectInput {
  @Field(() => String)
  projectName: string

  @Field(() => String, { nullable: true })
  projectUuid?: string

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo
}

@InputType()
export class LoginIAM2VirtualIDWithLdapInput {
  @Field(() => String)
  uid: string

  @Field(() => String)
  password: string

  @Field(() => String, { nullable: true })
  captchaUuid?: string

  @Field(() => String, { nullable: true })
  verifyCode?: string

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@InputType()
export class LoginByCasInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  password: string

  @Field(() => String)
  type: string

  @Field(() => ClientInfo, { nullable: true })
  clientInfo?: ClientInfo

  @Field(() => [String], { nullable: true })
  systemTags?: string[]
}

@ObjectType()
export class GetTwoFactorAuthenticationStateResp {
  @Field(() => String, { nullable: true })
  state?: string
}

@InputType()
export class LoginOAuthInput {
  @Field(() => String)
  sessionId: string

  @Field(() => String)
  userUuid: string

  @Field(() => String)
  accountUuid: string

  @Field(() => String)
  loginType: string
}

@ObjectType()
export class LoginOAuthResp {
  @Field(() => Boolean)
  isLogined: boolean

  @Field(() => String, { nullable: true })
  sessionId: string

  @Field(() => String, { nullable: true })
  accountUuid: string

  @Field(() => String, {
    nullable: true,
    deprecationReason: 'Account sessions no longer have a separate userUuid; use accountUuid.'
  })
  userUuid: string

  @Field(() => Identity, { nullable: true })
  currentIdentity?: Identity
}
