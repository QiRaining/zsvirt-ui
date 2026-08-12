import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { SNSApplicationPlatformState } from '@/common/enum'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

export enum EmailServerSettingQueryType {
  Share = 'Share',
  All = 'All',
  SelfHave = 'SelfHave'
}

registerEnumType(EmailServerSettingQueryType, {
  name: 'EmailServerSettingQueryType'
})

@ObjectType()
export class EmailAccountInfo {
  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string
}

@ObjectType()
export class EmailDetailInfo {
  @Field(() => Int)
  smtpPort: number

  @Field(() => String, { nullable: true })
  username?: string

  @Field(() => String, { nullable: true })
  smtpServer: string

  @Field(() => String, { nullable: true })
  password?: string
}

@ObjectType()
export class EmailServerSetting {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => SNSApplicationPlatformState)
  state: SNSApplicationPlatformState

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => EmailAccountInfo, { nullable: true })
  owner: EmailAccountInfo

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType

  @Field(() => Boolean, { nullable: true })
  toPublic?: boolean

  @Field(() => EmailDetailInfo, { nullable: true })
  emailPlat?: EmailDetailInfo
}
@ObjectType()
export class EmailServerSettingQueryResp {
  @Field(() => [EmailServerSetting], { nullable: true })
  list?: EmailServerSetting[]

  @Field(() => Int, { nullable: true })
  total?: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
@ArgsType()
export class QueryEmailServerSettingArgs extends QueryAction {}
