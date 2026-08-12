import { ObjectType, Field, registerEnumType, ID, ArgsType } from '@nestjs/graphql'

export enum TimeServerStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Unknown = 'Unknown'
}

registerEnumType(TimeServerStatus, {
  name: 'TimeServerStatus'
})

@ObjectType()
export class TimeServerNode {
  @Field(() => String)
  id: string

  @Field(() => String, { description: '时间源地址' })
  hostname: string

  @Field(() => TimeServerStatus, { nullable: true, description: '连接状态' })
  status?: TimeServerStatus
}

@ObjectType()
export class TimeServerRelation {
  @Field(() => String, { description: '外部时间源id' })
  source: string

  @Field(() => String, { description: '内部时间源id' })
  target: string
}

@ObjectType()
export class TimeServers {
  @Field(() => [TimeServerNode], { nullable: true, description: '内部时间源' })
  internal: TimeServerNode[]

  @Field(() => [TimeServerNode], { nullable: true, description: '外部时间源' })
  external: TimeServerNode[]
}

@ObjectType()
export class TimeServerResult {
  @Field(() => TimeServers, { description: '时间源集合' })
  servers: TimeServers

  @Field(() => [TimeServerRelation], {
    nullable: true,
    description: '时间源关系'
  })
  relations: TimeServerRelation[]
}

@ObjectType()
export class InternalTimeServerCandidate {
  @Field(() => String, { description: '时间源地址' })
  hostname: string

  @Field(() => Boolean, { nullable: true, description: '是否管理节点' })
  isManagementNode?: boolean
}
@ObjectType()
export class InternalTimeServerCandidateResult {
  @Field(() => [InternalTimeServerCandidate], { description: '时间源集合' })
  servers: InternalTimeServerCandidate[]
}

@ArgsType()
export class QueryTimeServerReachableArgs {
  @Field(() => [String], { nullable: true, description: '内部时间源列表' })
  internal?: string[]

  @Field(() => [String], { description: '外部时间源列表' })
  external: string[]
}

@ObjectType()
export class TimeServerReachable {
  @Field(() => String, { description: '时间源地址' })
  hostname: string

  @Field(() => Boolean, { description: '是否可达' })
  reachable: boolean
}

@ObjectType()
export class TimeServerReachableResult {
  @Field(() => [TimeServerReachable], { description: '时间源集合' })
  servers: TimeServerReachable[]
}

@ObjectType()
export class CephHealthResult {
  @Field(() => Boolean, { description: '是否健康' })
  health: boolean
}
