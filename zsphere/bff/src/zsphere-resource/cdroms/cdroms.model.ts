import { ObjectType, Field, Int, InputType } from '@nestjs/graphql'

import { ActionError } from '@/common/model/action-resp.model'

@ObjectType()
export class CdRom {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => Int, { nullable: true })
  deviceId?: number

  @Field(() => String, { nullable: true })
  isoUuid?: string

  @Field(() => String, { nullable: true })
  isoInstallPath?: string

  @Field(() => String, { nullable: true })
  isoName?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, {
    nullable: true,
    description: ''
  })
  occupant?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Boolean, { nullable: true })
  defaultflag?: boolean

  @Field(() => String)
  createDate: string

  @Field(() => String)
  lastOpDate: string
}

@ObjectType()
export class CdRomsQueryResp {
  @Field(() => [CdRom], { nullable: true })
  list?: CdRom[]

  @Field(() => Int, { nullable: true })
  total?: number
}
@ObjectType()
export class MaxAmount {
  @Field(() => Boolean, { nullable: true })
  createAble?: boolean
}

@ObjectType()
export class CdRomsActionResp {
  @Field(() => CdRom, { nullable: true })
  result?: CdRom

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

@InputType()
export class UpdateVmCdRomInput {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  name?: string
}

@InputType()
export class CreateVmCdRomInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => String, { nullable: true })
  isoUuid?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string
}

@ObjectType()
export class VMCdRomConfig {
  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String, { nullable: true })
  defaultValue?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  value?: string
}
