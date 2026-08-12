import { Field, ObjectType, ArgsType, Int } from '@nestjs/graphql'

import { ResourceStackStatus, StackEventStatus } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'
import { Owner } from '@/zsphere-resource/image/image.model'

@ObjectType()
export class ResourceStack {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => Owner, { nullable: true })
  owner?: Owner

  @Field(() => String, { nullable: true })
  version: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  templateContent: string

  @Field(() => String, { nullable: true })
  paramContent: string

  @Field(() => ResourceStackStatus, { nullable: true })
  status: ResourceStackStatus

  @Field(() => String, { nullable: true })
  reason: string

  @Field(() => Boolean, { nullable: true })
  enableRollback: boolean
}

@ObjectType()
export class QueryResourceStackResp extends QueryCommonResponse(ResourceStack) {}

@ObjectType()
export class EventFromResourceStack {
  @Field(() => String)
  id: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  action: string

  @Field(() => String, { nullable: true })
  content: string

  @Field(() => String, { nullable: true })
  duration: string

  @Field(() => String, { nullable: true })
  resourceName: string

  @Field(() => StackEventStatus, { nullable: true })
  actionStatus: StackEventStatus

  @Field(() => String, { nullable: true })
  stackUuid: string
}

@ObjectType()
export class QueryEventFromResourceStackResp extends QueryCommonResponse(EventFromResourceStack) {}

@ObjectType()
export class ResourceFromResourceStack {
  @Field(() => String)
  resourceType: string

  @Field(() => String)
  name: string

  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  createDate: string
}

@ObjectType()
export class GetResourceFromResourceStackResp extends QueryCommonResponse(
  ResourceFromResourceStack
) {}

@ObjectType()
export class ActionsMap {
  @Field(() => String, { nullable: true })
  resourceName: string

  @Field(() => String, { nullable: true })
  actionName: string

  @Field(() => Int, { nullable: true })
  round: number

  @Field(() => String, { nullable: true })
  actions: string

  @Field(() => String, { nullable: true })
  error: string

  @Field(() => [String], { nullable: true })
  inDegree: string[]
}

@ObjectType()
export class ConditionsMap {
  @Field(() => String, { nullable: true })
  uuid?: string
}

@ObjectType()
export class PreviewResourceStruct {
  @Field(() => ConditionsMap)
  conditions: ConditionsMap

  @Field(() => [ActionsMap])
  actions: ActionsMap[]
}

@ObjectType()
export class PreviewResult {
  @Field(() => PreviewResourceStruct, { nullable: true })
  preview?: PreviewResourceStruct
}

@ArgsType()
export class PreviewResourceStackArgs {
  @Field(() => String, {
    nullable: true,
    description: '堆栈内容，json字符串。与参数templateUuid二选一'
  })
  templateContent: string

  @Field(() => String, { nullable: true, description: '参数列表，json字符串' })
  parameters: string

  @Field(() => String, { nullable: true, description: '资源的唯一UUID' })
  uuid: string

  @Field(() => String, {
    nullable: true,
    description: '堆栈版本，默认为zstack'
  })
  type: string
}

@ArgsType()
export class CheckTemplateInput {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  templateContent?: string

  @Field(() => String, { nullable: true })
  type?: string
}

@ObjectType()
export class Parameter {
  @Field(() => String)
  paramName: string

  @Field(() => String, { nullable: true })
  type: string

  @Field(() => String, { nullable: true })
  defaultValue: string

  @Field(() => String, { nullable: true })
  description: string

  @Field(() => Boolean, { nullable: true })
  noEcho: boolean

  @Field(() => String, { nullable: true })
  label: string

  @Field(() => String, { nullable: true })
  constraintDescription: string

  @Field(() => String, { nullable: true })
  resourceType: string
}

@ObjectType()
export class CheckTemplateResp {
  @Field(() => [Parameter])
  parameters: Parameter[]
}
