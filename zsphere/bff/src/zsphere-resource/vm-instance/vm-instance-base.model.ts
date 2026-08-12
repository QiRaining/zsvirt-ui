import { Field, Float, ObjectType } from '@nestjs/graphql'

import { VolumeBase } from '@/zsphere-resource/volume/volume-base.model'

@ObjectType()
export class VmInstanceBase {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  zoneUuid?: string

  @Field(() => String, { nullable: true })
  clusterUuid?: string

  @Field(() => String, { nullable: true })
  imageUuid?: string

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  lastHostUuid?: string

  @Field(() => String, { nullable: true })
  instanceOfferingUuid?: string

  @Field(() => String, { nullable: true })
  rootVolumeUuid?: string

  @Field(() => String, { nullable: true })
  platform?: string

  @Field(() => String, { nullable: true })
  architecture?: string

  @Field(() => String, { nullable: true })
  defaultL3NetworkUuid?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  hypervisorType?: string

  @Field(() => Float, { nullable: true })
  memorySize?: number

  @Field(() => Float, { nullable: true })
  reservedMemorySize?: number

  @Field(() => Float, { nullable: true })
  cpuNum?: number

  @Field(() => Float, { nullable: true })
  cpuSpeed?: number

  @Field(() => String, { nullable: true })
  allocatorStrategy?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  state?: string

  @Field(() => [VolumeBase], { nullable: true })
  allVolumes?: VolumeBase[]

  @Field(() => String, { nullable: true })
  guestOsType?: string
}
