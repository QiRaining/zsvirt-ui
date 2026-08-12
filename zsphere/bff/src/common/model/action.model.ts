/**
 * 异步调用公共 model，一个 Action 包含1个或多个 Task，一个 Task 包含多个1个或多个 ZStack API 调用，Action 都是通过 mutation 发起，然后通过 subscription 返回
 */

import { InputType, Field, ObjectType, Int, registerEnumType } from '@nestjs/graphql'

@InputType()
export class ActionInput {
  @Field(() => String, {
    nullable: true,
    description: '唯一性ID，前端传入，维护 mutation 和 subscription 关系'
  })
  actionId?: string

  @Field(() => String, { nullable: true })
  name?: string

  @Field(() => Int, { defaultValue: 1, description: '子任务数量' })
  total: number
}

export abstract class AbstractActionInput {
  payload: any
  action: ActionInput
}

@ObjectType()
export class ActionResult {
  @Field(() => String)
  actionId: string
}

export enum ActionTaskState {
  success = 'success',
  suspended = 'suspended',
  running = 'running',
  fail = 'fail',
  exception = 'exception' // ActionTaskState 标识每个子任务的返回状态，针对单个子任务调用多个 ZStack API，第一步成功，后续有失败则返回异常
}

registerEnumType(ActionTaskState, {
  name: 'ActionTaskState'
})

@ObjectType()
export class ActionTaskResult {
  @Field(() => String, { description: 'websocket消息按照 sessionId 分发' })
  sessionId: string

  @Field(() => String, {
    description: '前端传入的 actionId 原封返还，用于建立关联'
  })
  actionId: string

  @Field(() => ActionTaskState, { description: '当前子任务执行状态' })
  state: ActionTaskState

  @Field(() => String, {
    nullable: true,
    description: 'inventory 的类型，用于改写前端 cache'
  })
  type?: string

  @Field(() => String, {
    nullable: true,
    description: '前端默认监听字段type，但是type主要用于cache，所以增加一个监听字段。',
    defaultValue: null
  })
  listenerType?: string

  @Field(() => String, {
    nullable: true,
    description:
      '操作的实体id，一般为 uuid，如果没有 uuid，需要绑定一个唯一性 key，并且与前端的缓存策略对应'
  })
  id?: string

  @Field(() => String, {
    nullable: true,
    description: '本次操作变更的字段，用于改写前端 cache'
  })
  fields?: string

  @Field(() => String, {
    nullable: true,
    description: 'ZStack 返回的 inventory，序列化后传给前端'
  })
  inventory?: string

  @Field(() => String, {
    nullable: true,
    description: 'ZStack 返回的 error，序列化后传给前端'
  })
  error?: string
}
