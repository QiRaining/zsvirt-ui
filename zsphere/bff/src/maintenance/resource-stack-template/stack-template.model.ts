import { Field, ObjectType, registerEnumType, ArgsType } from '@nestjs/graphql'

import { QueryCommonResponse, QueryAction } from '@/common/model/action-query.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'
import { Owner } from '@/zsphere-resource/image/image.model'

export enum StackTemplateQueryType {
  Custom = 'Custom',
  Example = 'Example',
  Normal = 'Normal',
  Self = 'Self',
  Share = 'Share'
}
registerEnumType(StackTemplateQueryType, {
  name: 'StackTemplateQueryType'
})

@ObjectType()
export class StackTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  version?: string

  @Field(() => Boolean, { nullable: true })
  state?: boolean

  @Field(() => String, { nullable: true })
  md5sum?: string

  @Field(() => String, { nullable: true })
  content?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  // 以下为VO属性
  @Field(() => Owner, { nullable: true })
  owner?: Owner

  @Field(() => Boolean, { nullable: true })
  isSystemTemplate?: boolean

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType
}

@ObjectType()
export class QueryStackTemplateResp extends QueryCommonResponse(StackTemplate) {}

@ArgsType()
export class QueryStackTemplateArgs extends QueryAction {
  @Field(() => StackTemplateQueryType, { nullable: true })
  declare type?: StackTemplateQueryType
}
