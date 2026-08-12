import {
  ObjectType,
  Field,
  registerEnumType,
  Int,
  ArgsType,
  OmitType,
  Float
} from '@nestjs/graphql'

import { QueryAction } from '@/common/model/action-query.model'

export enum InspectionTaskState {
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  SUSPENDED = 'SUSPENDED'
}

registerEnumType(InspectionTaskState, {
  name: 'InspectionTaskState'
})

export enum InspectionSubTaskState {
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EMPTY = 'EMPTY'
}

registerEnumType(InspectionSubTaskState, {
  name: 'InspectionSubTaskState'
})

export enum InspectionSubTaskHealthState {
  FAILED = 'FAILED',
  CRITICAL = 'CRITICAL',
  WARN = 'WARN',
  NORMAL = 'NORMAL'
}

registerEnumType(InspectionSubTaskHealthState, {
  name: 'InspectionSubTaskHealthState'
})

@ObjectType()
export class InspectionOriginItem {
  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => String, { nullable: true })
  resourceUuid?: string

  @Field(() => String, { nullable: true })
  resourceType?: string

  @Field(() => String, { nullable: true })
  ip?: string

  @Field(() => Int, { nullable: true })
  grade?: number

  @Field(() => String, { nullable: true })
  errInfo?: string

  @Field(() => String, { nullable: true })
  simpleErr?: string

  @Field(() => String, { nullable: true })
  expr?: string

  @Field(() => String, { nullable: true })
  origin?: string

  @Field(() => InspectionSubTaskHealthState, {
    nullable: true,
    description: '健康状态'
  })
  healthState?: InspectionSubTaskHealthState
}

@ObjectType()
export class InspectionItem {
  @Field(() => String, { nullable: true })
  key?: string

  @Field(() => String, { nullable: true, description: '名称' })
  name?: string

  @Field(() => String, { nullable: true, description: '子任务名称' })
  subTaskName?: string

  @Field(() => String, { nullable: true, description: '名称描述' })
  desc?: string

  @Field(() => String, { nullable: true, description: '标签分类' })
  tag?: string

  @Field(() => InspectionSubTaskState, { nullable: true, description: '状态' })
  state?: InspectionSubTaskState

  @Field(() => InspectionSubTaskHealthState, {
    nullable: true,
    description: '健康状态'
  })
  healthState?: InspectionSubTaskHealthState

  @Field(() => Boolean, {
    nullable: true,
    description: '是否有严重提示'
  })
  hasCritical?: boolean

  @Field(() => Boolean, {
    nullable: true,
    description: '是否有警告提示'
  })
  hasWarn?: boolean

  @Field(() => [InspectionOriginItem], {
    nullable: true,
    description: '原始数据'
  })
  originOutput?: InspectionOriginItem[]
}

@ObjectType()
export class InspectionTaskOutputResp {
  @Field(() => [InspectionOriginItem])
  list: InspectionOriginItem[]

  @Field(() => Int)
  total: number
}

@ObjectType()
export class InspectionItemTree {
  @Field(() => String, { nullable: true })
  key?: string

  @Field(() => [InspectionItem], { nullable: true })
  children?: InspectionItem[]
}

@ObjectType()
export class InspectionTask {
  @Field(() => String, { nullable: true })
  taskUuid?: string

  @Field(() => Float, { nullable: true, description: '开始时间' })
  startTime?: number

  @Field(() => Float, { nullable: true, description: '结束时间' })
  endTime?: number

  @Field(() => Float, { nullable: true, description: '用时' })
  runTime?: number

  @Field(() => Float, { nullable: true, description: '总分' })
  grade?: number

  @Field(() => Float, { nullable: true, description: '总任务数' })
  total?: number

  @Field(() => Float, { nullable: true, description: '异常任务数' })
  error?: number

  @Field(() => Float, { nullable: true, description: '正常任务数' })
  normal?: number

  @Field(() => Float, { nullable: true, description: '进度' })
  progress?: number

  @Field(() => InspectionTaskState, { nullable: true, description: '状态' })
  state?: InspectionTaskState

  @Field(() => [InspectionItemTree], { nullable: true, description: '子任务' })
  itemTree?: InspectionItemTree[]

  @Field(() => String, { nullable: true, description: '当前执行任务' })
  currentSubTask?: string
}

@ObjectType()
export class CrontabInspection extends InspectionTask {
  @Field(() => String, { nullable: true })
  statUuid?: string

  @Field(() => String, { nullable: true, description: '定时器' })
  cron?: string

  @Field(() => Float, { nullable: true })
  createTime?: number

  @Field(() => Float, { nullable: true })
  nextExecTime?: number

  @Field(() => Boolean, { nullable: true })
  enable?: boolean
}

@ObjectType()
export class InspectionResource {
  @Field(() => Float, { nullable: true, description: '物理机数量' })
  host?: number

  @Field(() => Float, { nullable: true, description: '镜像服务器数量' })
  backupStorage?: number

  @Field(() => Float, { nullable: true, description: '云主机数量' })
  vmInstance?: number

  @Field(() => Float, { nullable: true, description: '主存储数量' })
  primaryStorage?: number
}

@ArgsType()
export class QueryInsepctionArgs extends OmitType(QueryAction, ['sortBy']) {
  @Field(() => String, { nullable: true })
  sortBy?: string
}
