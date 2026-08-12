import { ArgsType, Field, Int, ObjectType, OmitType, registerEnumType } from '@nestjs/graphql'

import { BigInt } from '@/common/custom-scalars/big-int.scalar'
import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'
import { Cluster } from '@/hardware-resource/cluster/cluster.model'
import { ShareType } from '@/zsphere-administration/owner/owner.model'

import { VMGroupDirectory } from '../vm-directory-group/vm-directory-group.model'
import { VmInstance } from '../vm-instance/vm-instance.model'

export enum VmTemplateStatus {
  Active = 'active',
  Warning = 'warning',
  Error = 'error'
}

registerEnumType(VmTemplateStatus, {
  name: 'VmTemplateStatus'
})

export enum VmTemplateQueryType {
  NORMAL = 'NORMAL',
  ZSV_SHARED_RESOURCE = 'ZSV_SHARED_RESOURCE'
}

registerEnumType(VmTemplateQueryType, {
  name: 'VmTemplateQueryType'
})

@ObjectType()
export class VmTemplate {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  vmInstanceUuid: string

  @Field(() => Cluster)
  cluster: Cluster

  // @Field(() => Cluster)
  // host: Cluster

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => BigInt, { nullable: true })
  actualSize?: number

  @Field(() => String)
  createDate?: string

  @Field(() => String)
  lastOpDate?: string

  @Field(() => VmInstance, { nullable: true })
  vm?: VmInstance

  @Field(() => VMGroupDirectory, { nullable: true })
  group?: VMGroupDirectory

  @Field(() => ShareType, { nullable: true })
  shareType?: ShareType
}

@ObjectType()
export class VmTemplateQueryResp {
  @Field(() => [VmTemplate], { nullable: true })
  list?: VmTemplate[]

  @Field(() => Int, { nullable: true })
  total?: number
}

@ArgsType()
export class QueryVmTemplateArgs extends OmitType(QueryAction, ['type']) {
  @Field(() => VmTemplateQueryType, {
    nullable: true,
    defaultValue: VmTemplateQueryType.NORMAL
  })
  declare type?: VmTemplateQueryType
}

@ObjectType()
export class VmTemplateActionResp {
  @Field(() => VmTemplate, { nullable: true })
  result?: VmTemplate

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
