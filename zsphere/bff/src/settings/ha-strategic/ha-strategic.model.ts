import { ObjectType, InputType, Field } from '@nestjs/graphql'

import { ActionInput } from '@/common/model/action.model'
import { UpdateGlobalConfigPayload } from '@/settings/global-config/action/update-global-config'

@InputType()
export class HAStrategicInputObj {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  state: string

  @Field(() => String, { nullable: true })
  fencerName?: string
}

@InputType()
export class HAStrategicPayload {
  @Field(() => [HAStrategicInputObj])
  haStrategic: HAStrategicInputObj[]

  @Field(() => [UpdateGlobalConfigPayload], { nullable: true })
  updateGlobalConfigPayload?: Array<UpdateGlobalConfigPayload>
}

@InputType()
export class HAStrategicInput {
  @Field(() => HAStrategicPayload)
  payload: HAStrategicPayload

  @Field(() => ActionInput)
  action: ActionInput
}

@ObjectType()
export class HAStrategicObj {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  state: string

  @Field(() => String)
  fencerName: string
}
@ObjectType()
export class HAStrategic {
  @Field(() => [HAStrategicObj])
  haStrategic: HAStrategicObj[]
}
