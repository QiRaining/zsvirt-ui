import { ArgsType, Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Tag } from '@/zsphere-administration/tag/tag.model'

export enum SshKeyPairQueryType {
  NORMAL = 'NORMAL',
  GetAttachableSshKeyPairForVmInstance = 'GetAttachableSshKeyPairForVmInstance',
  GetDetachableSshKeyPairForVmInstance = 'GetDetachableSshKeyPairForVmInstance'
}

registerEnumType(SshKeyPairQueryType, {
  name: 'SshKeyPairQueryType'
})

@ArgsType()
export class QuerySshKeyPairArgs extends QueryAction {
  @Field(() => SshKeyPairQueryType, {
    nullable: true,
    defaultValue: SshKeyPairQueryType.NORMAL
  })
  declare type?: SshKeyPairQueryType
}

@ObjectType()
export class SshKeyPairOwner {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  linkedAccountUuid?: string
}

@ObjectType()
export class SshKeyPair {
  @Field(() => String)
  uuid: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  publicKey?: string

  // @Field(() => String, { nullable: true })
  // zoneUuid?: string

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '挂载的云主机数量'
  })
  vmNum?: number

  @Field(() => [Tag], { defaultValue: [] })
  tag?: Tag[]

  @Field(() => SshKeyPairOwner, { nullable: true })
  owner?: SshKeyPairOwner

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}

@ObjectType()
export class SshKeyPairList {
  @Field(() => Int)
  total: number

  @Field(() => [SshKeyPair], { defaultValue: [] })
  list?: SshKeyPair[]

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
