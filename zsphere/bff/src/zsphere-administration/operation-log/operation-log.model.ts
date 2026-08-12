import { ObjectType, Field, registerEnumType, Float } from '@nestjs/graphql'

import { QueryCommonResponse } from '@/common/model/action-query.model'
import { TaskProgress } from '@/common/task-progress/task-progress.model'

export enum OperationStatus {
  Success = 'Success',
  Running = 'Running',
  Failed = 'Failed',
  Exception = 'Exception',
  Canceled = 'Canceled',
  Canceling = 'Canceling',
  Timeout = 'Timeout',
  Suspended = 'Suspended',
  Unknown = 'Unknown'
}

export enum OperationApiStatus {
  Success = 'Success',
  Running = 'Running',
  Failed = 'Failed',
  Canceled = 'Canceled',
  Canceling = 'Canceling',
  Suspended = 'Suspended',
  Unknown = 'Unknown'
}

registerEnumType(OperationStatus, {
  name: 'OperationStatus'
})

registerEnumType(OperationApiStatus, {
  name: 'OperationApiStatus'
})

export enum OperationLongjobStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  CANCELING = 'CANCELING',
  SUSPENDED = 'SUSPENDED'
}

registerEnumType(OperationLongjobStatus, {
  name: 'OperationLongjobStatus'
})

@ObjectType()
export class OperationLongjob {
  @Field(() => String)
  longJobUuid: string

  @Field(() => String)
  jobName: string

  @Field(() => String)
  clientJobUuid: string

  @Field(() => String, { nullable: true })
  resourceType: string

  @Field(() => TaskProgress, { nullable: true })
  taskProgressDetails?: TaskProgress

  @Field(() => Float, { nullable: true })
  progress: number

  @Field(() => OperationLongjobStatus, { nullable: true })
  state: OperationLongjobStatus

  @Field(() => String, { nullable: true })
  userId: string

  @Field(() => String, { nullable: true })
  createDate: string

  @Field(() => String, { nullable: true })
  lastOpDate: string

  @Field(() => String, { nullable: true })
  data: string
}

@ObjectType()
export class OperationApi {
  @Field(() => String)
  apiId: string

  @Field(() => String)
  taskId: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => String, { nullable: true })
  req?: string

  @Field(() => String, { nullable: true })
  resp?: string

  @Field(() => OperationApiStatus)
  status: OperationApiStatus

  @Field(() => String, { nullable: true })
  signedText?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => String, { nullable: true })
  resourceName?: string

  @Field(() => OperationLongjob, { nullable: true })
  longjob?: OperationLongjob
}

@ObjectType()
export class OperationTask {
  @Field(() => String)
  taskId: string

  @Field(() => String)
  actionId: string

  @Field(() => OperationStatus)
  status: OperationStatus

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [OperationApi], { nullable: true })
  operationApis?: OperationApi[]
}

@ObjectType()
export class QueryOperationLongjobResp extends QueryCommonResponse(OperationLongjob) {}

@ObjectType()
export class OperationLog {
  @Field(() => String)
  actionId: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => [String], { nullable: true })
  resourceNames?: string[]

  @Field(() => [String], { nullable: true })
  resourceUuids?: string[]

  @Field(() => OperationStatus)
  status: OperationStatus

  @Field(() => String)
  userId: string

  @Field(() => String, { nullable: true })
  loginIp?: string

  @Field(() => String, { nullable: true })
  accountName?: string

  @Field(() => Float, { nullable: true })
  progress?: number

  @Field(() => String, { nullable: true })
  userName?: string

  @Field(() => String, { nullable: true })
  createDate?: string

  @Field(() => String, { nullable: true })
  lastOpDate?: string

  @Field(() => [OperationTask], { nullable: true })
  operationTasks?: OperationTask[]

  @Field(() => [OperationLongjob], { nullable: true })
  longjobs?: OperationLongjob[]

  @Field(() => Boolean, { nullable: true })
  isValid?: boolean
}

@ObjectType()
export class QueryOperationLogResp extends QueryCommonResponse(OperationLog) {}
