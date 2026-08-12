import { Field, ObjectType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class SNSTextTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  sign?: string

  @Field(() => String, { nullable: true })
  applicationPlatformType?: string

  @Field(() => String, { nullable: true })
  template?: string

  @Field(() => String, { nullable: true })
  recoveryTemplate?: string

  @Field(() => Boolean, { nullable: true })
  defaultTemplate?: boolean

  @Field(() => String, { nullable: true })
  eventTemplateCode?: string

  @Field(() => String, { nullable: true })
  eventTemplate?: string

  @Field(() => String, { nullable: true })
  alarmTemplateCode?: string

  @Field(() => String, { nullable: true })
  subject?: string

  @Field(() => String, { nullable: true })
  recoverySubject?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class AliyunSmsSNSTextTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  alarmTemplateCode: string

  @Field(() => String, { nullable: true })
  applicationPlatformType: string

  @Field(() => String, { nullable: true })
  eventTemplate: string

  @Field(() => String, { nullable: true })
  eventTemplateCode: string

  @Field(() => String, { nullable: true })
  sign: string

  @Field(() => String, { nullable: true })
  template: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string
}

@ObjectType()
export class QuerySNSTextTemplateResp extends QueryCommonResponse(SNSTextTemplate) {}

@ObjectType()
export class QueryAliyunSmsSNSTextTemplateResp extends QueryCommonResponse(
  AliyunSmsSNSTextTemplate
) {}
