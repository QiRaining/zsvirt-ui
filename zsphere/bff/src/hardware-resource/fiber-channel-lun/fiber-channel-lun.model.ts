import { ObjectType, Field, ArgsType, Int } from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { ScsiLun } from '../scsi-lun/scsi-lun.model'

@ArgsType()
export class QueryFiberChannelLunArgs extends QueryAction {
  @Field(() => String, { nullable: true, defaultValue: 'name' })
  declare sortBy?: string
}

@ObjectType()
export class FiberChannelLun extends ScsiLun {
  @Field(() => String, { nullable: true })
  fiberChannelStorageUuid?: string
}

@ObjectType()
export class FiberChannelLunList {
  @Field(() => [FiberChannelLun], { defaultValue: [] })
  list?: FiberChannelLun[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
