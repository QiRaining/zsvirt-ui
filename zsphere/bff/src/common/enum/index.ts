export * from './zstack'
export * from './common'

export enum ActionType {
  sync,
  async
}

export enum Op {
  eq = 'eq',
  ne = 'ne',
  gte = 'gte',
  gt = 'gt',
  lte = 'lte',
  lt = 'lt',
  like = 'like',
  notLike = 'notLike',
  is = 'is',
  not = 'not',
  in = 'in',
  notIn = 'notIn',
  has = 'has',
  notHas = 'notHas',
  query = 'query',
  and = 'and',
  or = 'or'
}
