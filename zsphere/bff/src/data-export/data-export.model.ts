import { ArgsType, Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'

import { Condition, QueryAction, SortDirectionValidValues } from '@/common/model/action-query.model'

export enum ExportTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

registerEnumType(ExportTaskStatus, {
  name: 'ExportTaskStatus'
})

@ArgsType()
@ObjectType()
export class CreateExportTaskArgs extends QueryAction {
  @Field(() => String)
  resourceType: string

  @Field(() => [Condition])
  declare conditions: Condition[]

  @Field(() => [String])
  declare fields: string[]

  @Field(() => [String])
  headers: string[]

  @Field(() => String)
  sessionId: string

  @Field(() => String, { description: '用来国际化' })
  locale: string

  @Field(() => String)
  actionId: string

  @Field(() => Int, { nullable: true })
  declare limit?: number

  @Field(() => Int, { nullable: true })
  declare start?: number

  @Field(() => Boolean, { nullable: true })
  declare count?: boolean

  @Field(() => String, { nullable: true })
  declare sortBy?: string

  @Field(() => SortDirectionValidValues, {
    nullable: true,
    defaultValue: 'desc'
  })
  declare sortDirection?: SortDirectionValidValues
}

@ObjectType()
export class ExportTask {
  @Field(() => String)
  taskId: string

  @Field(() => ExportTaskStatus, { nullable: true })
  status?: ExportTaskStatus

  @Field(() => String, { nullable: true })
  error?: string

  @Field(() => String, { nullable: true })
  downloadUrl?: string
}

@ObjectType()
export class ExportTaskExportPayload {
  @Field({ description: 'apiInspector 消息按照 sessionId 分发' })
  sessionId: string

  @Field(() => ExportTask, {
    nullable: true,
    description: 'ExportTas消息'
  })
  payload: ExportTask
}

@ObjectType()
export class ExportTaskRes {
  @Field(() => String)
  sessionId: string

  @Field(() => ExportTask)
  payload: ExportTask
}
