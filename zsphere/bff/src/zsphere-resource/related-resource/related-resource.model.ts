import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class VmRelatedResource {
  @Field(() => Int)
  volume: number

  @Field(() => Int)
  lastVolume: number

  @Field(() => Int)
  nic: number

  @Field(() => Int)
  cdrom: number

  @Field(() => Int)
  lun: number

  @Field(() => Int)
  usb: number

  @Field(() => Int)
  se: number

  @Field(() => Int)
  gpu: number

  @Field(() => Int)
  vgpu: number

  @Field(() => Int)
  pci: number
}

@ObjectType()
export class VmExternalDevice {
  @Field(() => Int)
  lun: number

  @Field(() => Int)
  usb: number

  @Field(() => Int)
  gpu: number

  @Field(() => Int)
  vgpu: number

  @Field(() => Int)
  pci: number
}
