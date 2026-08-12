import { ObjectType, Field, ArgsType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { ScsiLun } from '../scsi-lun/scsi-lun.model'

@ArgsType()
export class QueryIscsiLunArgs extends QueryAction {
  @Field(() => String, { nullable: true, defaultValue: 'name' })
  declare sortBy?: string
}

@ObjectType()
export class IscsiLun extends ScsiLun {
  @Field(() => String, { nullable: true })
  iscsiTargetUuid?: string

  @Field(() => String, { nullable: true })
  hctl?: string
}

@ObjectType()
export class IscsiLunList {
  @Field(() => [IscsiLun], { defaultValue: [] })
  list?: IscsiLun[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
