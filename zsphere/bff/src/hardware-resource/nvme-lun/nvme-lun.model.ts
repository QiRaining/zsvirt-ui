import {
  ObjectType,
  Field,
  ArgsType,
  Float,
  OmitType,
  registerEnumType,
  Int
} from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'
import { ActionError } from '@/common/model/action-resp.model'

import { NvmeServer } from '../nvme-server/nvme-server.model'
import { ScsiLun } from '../scsi-lun/scsi-lun.model'

export enum NVMeLunType {
  'Normal' = 'Normal',
  'TransportNotPcie' = 'TransportNotPcie'
}

registerEnumType(NVMeLunType, {
  name: 'NVMeLunType'
})

@ObjectType()
export class NvmeLunHostRefInventory {
  @Field(() => Float, { nullable: true })
  id?: number

  @Field(() => String, { nullable: true })
  hostUuid?: string

  @Field(() => String, { nullable: true })
  nvmeLunUuid?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string
}
@ArgsType()
export class QueryNVMeLunArgs extends QueryAction {
  @Field(() => String, { nullable: true, defaultValue: 'name' })
  declare sortBy?: string

  @Field(() => NVMeLunType, { nullable: true })
  declare type?: NVMeLunType
}

@ObjectType()
export class NVMeLun extends OmitType(ScsiLun, ['scsiLunHostRefs', 'scsiLunVmInstanceRefs']) {
  @Field(() => String, { nullable: true })
  nvmeTargetUuid?: string

  @Field(() => [NvmeLunHostRefInventory], { defaultValue: [] })
  nvmeLunHostRefs?: NvmeLunHostRefInventory[]

  @Field(() => NvmeServer, { nullable: true })
  nvmeServer?: NvmeServer
}

@ObjectType()
export class NVMeLunList {
  @Field(() => [NVMeLun], { defaultValue: [] })
  list?: NVMeLun[]

  @Field(() => Int)
  total: number

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}
