import { Type } from '@nestjs/common'
import {
  Field,
  Int,
  registerEnumType,
  ArgsType,
  ObjectType,
  Float,
  InputType
} from '@nestjs/graphql'
import { GraphQLScalarType } from 'graphql'

import { Op } from '@/api/zstack/base/query-base'

// https://docs.nestjs.com/graphql/scalars#create-a-custom-scalar
function validateCondtionValue(value: unknown): any {
  if (!['string', 'number', 'boolean'].includes(typeof value)) {
    throw new Error('invalid value, shoud be string or number or boolean')
  }
  return value
}

export const CondtionValueScalar = new GraphQLScalarType({
  name: 'CondtionValue',
  description: 'A custom parser',
  serialize: value => validateCondtionValue(value),
  parseValue: value => validateCondtionValue(value)
})

export enum SortDirectionValidValues {
  asc = 'asc',
  desc = 'desc'
}

registerEnumType(SortDirectionValidValues, {
  name: 'SortDirectionValidValues'
})

registerEnumType(Op, {
  name: 'Op'
})

@InputType()
export class Condition {
  @Field(() => String, { nullable: true, description: '查询条件的字段名' })
  key?: string

  @Field(() => CondtionValueScalar, {
    nullable: true,
    description: '查询条件的值'
  })
  value?: any

  @Field(() => [CondtionValueScalar], {
    nullable: true,
    description: '查询条件的多个值'
  })
  values?: any[]

  @Field(() => Op, { nullable: true, description: '查询条件的操作符' })
  op?: Op
}

@ArgsType()
@ObjectType()
export class QueryAction {
  @Field(() => [Condition], {
    nullable: true,
    defaultValue: [],
    description: '查询条件列表'
  })
  conditions?: Condition[]

  @Field(() => [Condition], {
    nullable: true,
    defaultValue: [],
    description: '额外的查询条件列表'
  })
  extraConditions?: Condition[]

  @Field(() => Int, { nullable: true, description: '查询结果的最大数量限制' })
  limit?: number

  @Field(() => Int, { nullable: true, description: '查询结果的起始位置' })
  start?: number

  @Field(() => Boolean, { nullable: true, description: '是否只返回结果数量' })
  count?: boolean

  @Field(() => String, { nullable: true, description: '按指定字段分组' })
  groupBy?: string

  @Field(() => Boolean, { nullable: true, description: '是否返回总数量' })
  replyWithCount?: boolean

  @Field(() => String, {
    nullable: true,
    defaultValue: 'createDate',
    description: '排序字段'
  })
  sortBy?: string

  @Field(() => SortDirectionValidValues, {
    nullable: true,
    defaultValue: 'desc',
    description: '排序方向'
  })
  sortDirection?: SortDirectionValidValues

  @Field(() => [String], {
    nullable: true,
    defaultValue: [],
    description: '需要返回的字段列表'
  })
  fields?: string[]

  @Field(() => String, { nullable: true, description: '查询类型' })
  type?: string
}

export function QueryCommonResponse<T>(classRef: Type<T>): any {
  @ObjectType({ isAbstract: true })
  abstract class Rs {
    @Field(() => [classRef], { nullable: true, description: '查询结果列表' })
    list?: T[]

    @Field(() => Float, { nullable: true, description: '查询结果总数' })
    total: number
  }

  return Rs as any
}
