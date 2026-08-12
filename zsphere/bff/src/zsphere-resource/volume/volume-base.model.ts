import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class VolumeBase {
  @Field(() => String, { nullable: true })
  uuid?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  primaryStorageUuid?: string

  @Field(() => String, { nullable: true })
  vmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  diskOfferingUuid?: string

  @Field(() => String, { nullable: true })
  rootImageUuid?: string

  @Field(() => String, { nullable: true })
  installPath?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  format?: string

  @Field(() => Float, { nullable: true })
  size?: number

  @Field(() => Float, { nullable: true })
  actualSize?: number

  @Field(() => Float, { nullable: true })
  deviceId?: number

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => String, { nullable: true })
  status?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => Boolean, { nullable: true })
  isShareable?: boolean

  @Field(() => String, { nullable: true })
  volumeQos?: string

  @Field(() => String, { nullable: true })
  lastDetachDate?: string

  @Field(() => String, { nullable: true })
  lastVmInstanceUuid?: string

  @Field(() => String, { nullable: true })
  lastAttachDate?: string

  @Field(() => String, { nullable: true })
  protocol?: string
}
