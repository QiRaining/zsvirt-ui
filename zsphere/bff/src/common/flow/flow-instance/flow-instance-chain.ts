import { isArray as _isArray, forEach as _forEach, compact as _compact } from 'lodash'

import FlowConst from '@/common/flow/const'

export function serial(tasks, config?) {
  const flow = {
    service: FlowConst.flow.SERIAL,
    children: [],
    config
  }
  _forEach(tasks, item => {
    if (!_isArray(item)) {
      item = [item]
    }
    flow.children = _compact(flow.children.concat(item))
  })
  return flow.children.length > 0 ? flow : []
}

export function parallel(tasks, config?) {
  const flow = {
    service: FlowConst.flow.PARALLEL,
    children: [],
    config: {
      isolateError: true,
      ...config
    }
  }
  _forEach(tasks, item => {
    if (!_isArray(item)) {
      item = [item]
    }
    flow.children = _compact(flow.children.concat(item))
  })
  return flow.children.length > 0 ? flow : []
}
