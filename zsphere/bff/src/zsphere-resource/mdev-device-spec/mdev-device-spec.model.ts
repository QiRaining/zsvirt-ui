import { Field, ObjectType, InputType, registerEnumType, ArgsType } from '@nestjs/graphql'

import { QueryCommonResponse, QueryAction } from '@/common/model/action-query.model'
import { ActionInput } from '@/common/model/action.model'

export enum MdevDeviceSpecQueryType {
  'Normal' = 'Normal',
  GetMdevDeviceCandidatesForGenerate = 'GetMdevDeviceCandidatesForGenerate'
}

registerEnumType(MdevDeviceSpecQueryType, {
  name: 'MdevDeviceSpecQueryType'
})

@ObjectType()
export class MdevDeviceSpec {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  specification?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@InputType()
export class UpdateMdevDeviceSpecPayload {
  @Field(() => String)
  uuid: string
}

@InputType()
export class UpdateMdevDeviceSpecInput {
  @Field(() => [UpdateMdevDeviceSpecPayload])
  payload: UpdateMdevDeviceSpecPayload[]

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
export class MdevDeviceSpecQueryResp extends QueryCommonResponse(MdevDeviceSpec) {}

@ArgsType()
export class QueryMdevDeviceSpecArgs extends QueryAction {
  @Field(() => MdevDeviceSpecQueryType, {
    nullable: true,
    defaultValue: MdevDeviceSpecQueryType.Normal
  })
  declare type?: MdevDeviceSpecQueryType
}
