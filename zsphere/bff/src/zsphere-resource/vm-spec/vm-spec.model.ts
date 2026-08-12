import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'

export enum DomainMode {
  Domain = 'Domain',
  WorkGroup = 'WorkGroup'
}

registerEnumType(DomainMode, {
  name: 'DomainMode'
})

export enum VmSpecPlatform {
  Windows = 'Windows',
  Linux = 'Linux'
}

registerEnumType(VmSpecPlatform, {
  name: 'VmSpecPlatform'
})

@ObjectType()
export class VmCustomSpecification {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => VmSpecPlatform)
  platform: VmSpecPlatform

  @Field(() => String, { nullable: true })
  hostname?: string

  @Field(() => Boolean, { nullable: true })
  generateSID?: boolean

  @Field(() => DomainMode, { nullable: true })
  domainMode?: DomainMode

  @Field(() => String, { nullable: true })
  domainName?: string

  @Field(() => String, { nullable: true })
  domainUsername?: string

  @Field(() => String, { nullable: true })
  organization?: string

  @Field(() => String, { nullable: true })
  createDate?: string
}

@ObjectType()
export class VmCustomSpecificationResp extends QueryCommonResponse(VmCustomSpecification) {}
