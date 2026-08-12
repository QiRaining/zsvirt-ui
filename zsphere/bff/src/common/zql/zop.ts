import { Op as ZOp } from '../../api/zstack/base/query-base'

export const ZOpMap = new Map([
  [ZOp.eq, { value: '=', type: 'basic' }],
  [ZOp.ne, { value: '!=', type: 'basic' }],
  [ZOp.gte, { value: '>=', type: 'basic' }],
  [ZOp.gt, { value: '>', type: 'basic' }],
  [ZOp.lte, { value: '<=', type: 'basic' }],
  [ZOp.lt, { value: '<', type: 'basic' }],
  [ZOp.like, { value: ' like ', type: 'basic' }],
  [ZOp.notLike, { value: ' not like ', type: 'basic' }],
  [ZOp.exactLike, { value: ' exactlike ', type: 'basic' }],
  [ZOp.exactNotLike, { value: ' not exactlike ', type: 'basic' }],
  [ZOp.is, { value: ' is ', type: 'single' }],
  [ZOp.not, { value: ' is not ', type: 'single' }],
  [ZOp.in, { value: ' in ', type: 'basic' }],
  [ZOp.notIn, { value: ' not in ', type: 'basic' }],
  [ZOp.has, { value: ' has ', type: 'basic' }],
  [ZOp.notHas, { value: ' not has ', type: 'basic' }],
  [ZOp.query, { value: 'query', type: 'zql' }],
  [ZOp.getapi, { value: 'getapi', type: 'getapi' }],
  [ZOp.and, { value: 'and', type: 'logic' }],
  [ZOp.or, { value: 'or', type: 'logic' }]
])

export default ZOp
