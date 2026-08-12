import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql'

export enum ApiInspectorMethod {
  GQL = 'GQL',
  ZQL = 'ZQL',
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  UNKNOWN = 'UNKNOWN'
}

registerEnumType(ApiInspectorMethod, {
  name: 'ApiInspectorMethod'
})

export enum ApiInspectorType {
  Request = 'Request',
  WaitingWebHook = 'WaitingWebHook',
  Response = 'Response'
}

registerEnumType(ApiInspectorType, {
  name: 'ApiInspectorType'
})

@ObjectType()
export class ApiInspectorDetail {
  @Field(() => String, { nullable: true, description: 'traceId' })
  traceId?: string

  @Field(() => String, { nullable: true, description: 'apiId' })
  apiId?: string

  @Field(() => ApiInspectorType, {
    description: 'Request or Response or WaitingWebHook'
  })
  type: ApiInspectorType

  @Field(() => ApiInspectorMethod, { description: 'method 类型' })
  method: ApiInspectorMethod

  @Field(() => Float, { description: '时间戳' })
  timestamp: number

  @Field(() => String, { nullable: true, description: 'zql 语句' })
  zql?: string

  @Field(() => String, { nullable: true, description: 'reqPath' })
  reqPath?: string

  @Field(() => String, { nullable: true, description: 'body' })
  body?: string

  @Field(() => String, { nullable: true, description: 'response' })
  response?: string

  @Field(() => String, { nullable: true, description: 'ts sdk name' })
  sdkName?: string
}

@ObjectType()
export class ApiInspector {
  @Field(() => String, { description: 'apiInspector 消息按照 sessionId 分发' })
  sessionId: string

  @Field(() => ApiInspectorDetail, {
    nullable: true,
    description: 'ApiInspector消息'
  })
  payload: ApiInspectorDetail
}
