import { Field, Float, ID, ObjectType } from '@nestjs/graphql'

import { LunSource, SharedBlockState, SharedBlockStatus } from '@/common/enum'
import { QueryCommonResponse } from '@/common/model/action-query.model'

@ObjectType()
export class SharedBlockCapacity {
  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '可用容量'
  })
  availableCapacity?: number

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: '总容量'
  })
  totalCapacity?: number
}

@ObjectType()
export class SharedBlock {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  diskUuid?: string

  @Field(() => String, { nullable: true })
  sharedBlockGroupUuid?: string

  @Field(() => SharedBlockState, { nullable: true })
  state?: SharedBlockState

  @Field(() => SharedBlockStatus, { nullable: true })
  status?: SharedBlockStatus

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => SharedBlockCapacity, { nullable: true })
  sharedBlockCapacity?: SharedBlockCapacity

  @Field(() => LunSource, {
    nullable: true,
    description: 'lun 来源，根据diskUuid 获取'
  })
  source?: LunSource
}

@ObjectType()
export class CandidateSharedBlock {
  @Field(() => String)
  uuid: string

  @Field(() => String, { description: '资源名称' })
  name: string

  @Field(() => String, { description: '磁盘全局唯一表示' })
  wwid: string

  @Field(() => String, { description: '磁盘WWN', nullable: true })
  wwn: string

  @Field(() => String, { description: '磁盘供应商', nullable: true })
  vendor: string

  @Field(() => String, { description: 'SCSI设备HCTL', nullable: true })
  hctl: string

  @Field(() => String, { description: '磁盘型号', nullable: true })
  model: string

  @Field(() => String, { description: '磁盘序列号', nullable: true })
  serial: string

  @Field(() => String, { description: '设备类型', nullable: true })
  type: string

  @Field(() => String, { description: '磁盘路径', nullable: true })
  path: string

  @Field(() => String, { description: '磁盘启用状态', nullable: true })
  state: string

  @Field(() => String, { description: '磁盘大小', nullable: true })
  size?: string

  @Field(() => String, {
    nullable: true,
    description: '目标标识符, nvme 是nqn, fc 是wwnn, iscsi 是iqn '
  })
  targetIdentifier?: string

  @Field(() => String, {
    nullable: true,
    description: 'iscsi fc nvme 可能存在，可能不存在。'
  })
  source?: string

  @Field(() => String, {
    nullable: true,
    description: 'iscsi fc tcp 可能存在，可能不存在。'
  })
  transport?: string

  @Field(() => String, { description: '创建时间', nullable: true })
  createDate: string

  @Field(() => String, { description: '最后一次修改时间', nullable: true })
  lastOpDate: string
}

@ObjectType()
export class SharedBlockResponse extends QueryCommonResponse(SharedBlock) {}

@ObjectType()
export class CandidateSharedBlockResponse extends QueryCommonResponse(CandidateSharedBlock) {}

/**
 * 主机已存在的 LUN wwid 条目
 *
 * 对应后端 Map<String, List<String>> existLunWwidsByHost
 * key = hostUuid, value = wwid 列表
 */
@ObjectType()
export class DiscoveredSharedBlock {
  @Field(() => String, { description: '磁盘 WWID' })
  diskUuid: string

  @Field(() => Number, { description: '磁盘容量（字节）' })
  totalCapacity: number

  @Field(() => String, { description: '供应商' })
  vendor: string
}

/**
 * 共享块组 LUN 信息
 *
 * 对应后端 APIDiscoverStrangePrimaryStorageMsg 返回的 inventory：
 * - uuid: VG UUID
 * - status: Connected | Disconnected
 * - sharedBlocks: List<SharedBlockInventory>（diskUuid, totalCapacity, vendor）
 */
@ObjectType()
export class SharedBlockGroupLunInfo {
  @Field(() => String, { description: 'VG UUID' })
  vgUuid: string

  @Field(() => [DiscoveredSharedBlock], {
    defaultValue: [],
    description: '发现的共享块磁盘列表'
  })
  sharedBlocks: DiscoveredSharedBlock[]

  @Field(() => String, {
    description: 'VG 状态：Connected 表示完整，Disconnected 表示不完整'
  })
  status: string
}

/**
 * 发现未纳管主存储的查询返回类型
 *
 * 对应后端 APIDiscoverStrangePrimaryStorageMsg 返回：
 * - inventories: List<PrimaryStorageInventory>（多态）
 * 前端以 lunInfos 数组形式建模
 */
@ObjectType()
export class SharedBlockGroupLunsResponse {
  @Field(() => [SharedBlockGroupLunInfo], {
    defaultValue: [],
    description: 'Map<vgUuid, SharedBlockGroupLunInfo> 以数组形式返回'
  })
  lunInfos: SharedBlockGroupLunInfo[]
}
