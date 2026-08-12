import {
  ObjectType,
  ArgsType,
  Field,
  Int,
  Float,
  InputType,
  registerEnumType
} from '@nestjs/graphql'

import { Condition } from '../model/action-query.model'

@ObjectType()
export class MetricData {
  @Field(() => Float)
  time: number

  @Field(() => String)
  metricName: string

  @Field(() => Float)
  value: number

  @Field(() => String)
  type: string

  @Field(() => String, { nullable: true })
  label?: string
}

@ObjectType()
@InputType('MetricItemInput')
export class MetricItem {
  @Field(() => String)
  metricName: string

  @Field(() => [Condition], { nullable: true })
  conditions?: Condition[]
}

@ArgsType()
export class QueryMetricDataArgs {
  @Field(() => String)
  namespace: string

  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => Float)
  period: number

  @Field(() => String)
  metricName: string

  @Field(() => [Condition], { nullable: true })
  conditions?: Condition[]
}

@ArgsType()
export class QueryMetricDataListArgs {
  @Field(() => String)
  namespace: string

  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => Float)
  period: number

  @Field(() => [MetricItem])
  metricList: MetricItem[]
}

export enum GetMetricDataQueryType {
  VmInstance = 'VmInstance', // 云主机和云路由都可以用
  Host = 'Host', // 物理机监控
  PrimaryStorage = 'PrimaryStorage', // 主存储监控
  BackupStorage = 'BackupStorage', // 镜像服务器监控
  GetVmMetricDataByCluster = 'GetVmMetricDataByCluster',
  GetHostMetricDataByCluster = 'GetHostMetricDataByCluster',
  GetHostMultiPathMetric = 'GetHostMultiPathMetric',
  BaremetalInstance = 'BaremetalInstance', // 裸金属
  BareMetal2Instance = 'BareMetal2Instance', // 弹性裸金属
  L3Network = 'L3Network', // 三层网络
  VIP = 'VIP', // 虚拟IP
  EIP = 'EIP', // 弹性IP
  LoadBalancer = 'LoadBalancer', // 负载均衡
  LoadBalancerListener = 'LoadBalancerListener', // 负载均衡
  VRouter = 'VRouter' // VPC路由器
}

registerEnumType(GetMetricDataQueryType, {
  name: 'GetMetricDataQueryType'
})

@ObjectType()
@InputType()
export class MetricParam {
  @Field(() => String)
  namespace: string

  // offsetAheadOfCurrentTime 能达到和startTime、endTime一样的效果，但是offsetAheadOfCurrentTime太慢，所以尽量不要使用，等后端fix
  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => Float)
  period: number

  @Field(() => String)
  metricName: string

  // 新增函数参数
  @Field(() => [String], { nullable: true })
  functions?: string[]

  @Field(() => [Condition], { nullable: true, description: '仅用来组装labels' })
  conditions?: Condition[]
}

@ArgsType()
@InputType()
export class ZQLGetMetricDataListArgs {
  @Field(() => GetMetricDataQueryType)
  type: GetMetricDataQueryType

  @Field(() => [MetricParam], { description: '多个监控项可以一起查询。' })
  metricParams: MetricParam[]

  @Field(() => [Condition], {
    nullable: true,
    description: '用来存放资源的UUID，和资源的conditions(不是MetricData的condition)。'
  })
  conditions?: Condition[]
}

@ObjectType()
@InputType()
export class BatchZQLGetMetricDataListArgs {
  @Field(() => String)
  name: string

  @Field(() => ZQLGetMetricDataListArgs)
  args: ZQLGetMetricDataListArgs
}

@ArgsType()
export class BatchZQLGetMetricDataListArgsList {
  @Field(() => [BatchZQLGetMetricDataListArgs])
  argsList: BatchZQLGetMetricDataListArgs[]
}

@ObjectType()
export class BatchZQLGetMetricDataListRes {
  @Field(() => String)
  name: string

  @Field(() => [MetricData])
  list: MetricData[]
}

@ObjectType()
export class MetricLabelValue {
  @Field(() => String)
  value: string
}

@ArgsType()
export class QueryMetricLabelValueArgs {
  @Field(() => String)
  namespace: string

  @Field(() => String)
  metricName: string

  @Field(() => String)
  labelName: string

  @Field(() => String, { nullable: true })
  filterLabels?: string

  @Field(() => Float, { nullable: true })
  startTime?: number

  @Field(() => Float, { nullable: true })
  endTime?: number
}

@ArgsType()
export class GetMetricDataListArgs {
  @Field(() => String)
  namespace: string

  @Field(() => Float)
  startTime: number

  @Field(() => Float)
  endTime: number

  @Field(() => Float)
  period: number

  @Field(() => [MetricItem])
  metricList: MetricItem[]
}

@ArgsType()
export class GetMetricDataArgs {
  @Field(() => String)
  uuid: string

  @Field(() => String)
  namespace: string

  @Field(() => String)
  metricName: string

  @Field(() => Float, { nullable: true })
  startTime?: number

  @Field(() => Float, { nullable: true })
  endTime?: number

  @Field(() => Int, { nullable: true })
  offsetAheadOfCurrentTime?: number

  @Field(() => Int, { nullable: true })
  period?: number

  @Field(() => [String], { nullable: true })
  labels?: string[]

  @Field(() => [String], { nullable: true })
  functions?: string[]

  @Field(() => String, { nullable: true })
  systemTags?: string[]

  @Field(() => [String], { nullable: true })
  userTags?: string[]

  @Field(() => String, { nullable: true })
  sessionId?: string

  @Field(() => String, { nullable: true })
  accessKeyId?: string

  @Field(() => String, { nullable: true })
  accessKeySecret?: string

  @Field(() => String, { nullable: true })
  requestIp?: string
}
