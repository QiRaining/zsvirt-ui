import { Type } from '@nestjs/common'
import { Field, ObjectType, Int, registerEnumType } from '@nestjs/graphql'

@ObjectType()
export class ActionError {
  @Field(() => String, { nullable: true })
  code?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  details?: string
}

@ObjectType()
export class TaskResource {
  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String)
  uuid: string
}

@ObjectType()
export class TaskResult {
  @Field(() => String, { nullable: true })
  taskName?: string

  @Field(() => [TaskResource], { nullable: true })
  resources: TaskResource[]
}

@ObjectType()
export class TaskError {
  @Field(() => String, { nullable: true })
  code?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  details?: string
}

@ObjectType()
export class ActionResp {
  @Field(() => String)
  actionId: string

  @Field(() => TaskResult, { nullable: true })
  result?: TaskResult

  @Field(() => TaskError, { nullable: true })
  error?: TaskError
}

export enum ActionRespTaskState {
  Running = 'Running',
  Success = 'Success',
  Error = 'Error'
}

registerEnumType(ActionRespTaskState, {
  name: 'ActionRespTaskState'
})

@ObjectType()
export class IComplexActionResp {
  @Field(() => String)
  actionId: string

  @Field(() => ActionRespTaskState)
  state: string

  @Field(() => Int)
  success: number

  @Field(() => Int)
  error?: number

  @Field(() => Int)
  total?: number
}

@ObjectType()
export class ISimpleActionResp {
  @Field(() => String)
  actionId: string

  result?: any

  @Field(() => ActionError, { nullable: true })
  error?: ActionError
}

export interface IBaseQueryResp<T> {
  list?: Array<T>
  total?: number
}

export interface IBaseQueryRespCoustructor<T> {
  new (): IBaseQueryResp<T>
}

// 和 BaseActionResp 定义相同的类型
export interface IBaseActionResp<T> {
  result?: T
  error?: ActionError
}

export interface IBaseActionRespConstructor<T> {
  new (): IBaseActionResp<T>
}

@ObjectType()
export class ResponseActionInfo {
  @Field(() => String)
  actionId: string

  @Field(() => ActionRespTaskState)
  state: string

  @Field(() => Int)
  success: number

  @Field(() => Int)
  error?: number

  @Field(() => Int)
  total?: number
}

export function CreateActionResp<T>(classRef: Type<T>): IBaseActionRespConstructor<T> {
  @ObjectType({ isAbstract: true })
  abstract class BaseActionResp {
    @Field(() => classRef, { nullable: true })
    inventory?: T

    @Field(() => ActionError, { nullable: true })
    error?: ActionError

    @Field(() => ResponseActionInfo, { nullable: true })
    action?: ResponseActionInfo
  }

  return BaseActionResp as any
}
