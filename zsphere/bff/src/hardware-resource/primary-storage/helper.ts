import * as _ from 'lodash'

export const PS_TYPES = [
  'LocalStorage',
  'NFS',
  'SharedMountPoint',
  'Ceph',
  'ZBS',
  'ZHPS',
  'Fusionstor',
  'SharedBlock',
  'BlockStorage',
  'AliyunNAS',
  'AliyunEBS'
]

function createExclusiveCondition(includedTypes) {
  return PS_TYPES.map(type => {
    if (includedTypes.includes(type)) {
      return `${type}(>=1)`
    } else {
      return `${type}(=0)`
    }
  }).join(' && ')
}

export const AddonPs = ['ZBS', 'ZHPS']

/**
 * rule 对象的左边是集群已加载的主存储，右边是与集群可以与之共存的主存储，()表达式是集群已加载的主存储的数量限制
 **/

export const CLUSTER_PRIMARYSTORAGE = {
  rules: [
    { 'LocalStorage(>1)': ['LocalStorage', 'Ceph', 'SharedBlock'] },
    { 'LocalStorage(=3)': ['LocalStorage', 'Ceph', 'SharedBlock'] },
    { 'LocalStorage(>3)': ['LocalStorage', 'SharedBlock'] },
    {
      'LocalStorage(=1)': [
        'LocalStorage',
        'NFS',
        'SharedMountPoint',
        'SharedBlock',
        'Ceph',
        'BlockStorage'
      ]
    },
    { 'NFS(>1)': ['NFS', 'SharedBlock'] },
    { 'NFS(=1)': ['LocalStorage', 'NFS', 'SharedBlock'] },
    { 'SharedMountPoint(=1)': ['LocalStorage'] },
    { 'Ceph(=1)': ['SharedBlock', 'LocalStorage'] },
    { 'Fusionstor(=1)': [] },
    { 'Addon(=1)': [] }, // 特殊类型
    { 'ZHPS(=1)': [] }, // 一个集群只能加载一个Vhost主存储
    { 'ZBS(=1)': ['SharedBlock'] }, // 一个集群只能加载一个 ZBS 主存储 或者 加载一个 slb 主存储 和 一个 ZBS 主存储
    { 'LocalStorage(>=1) && Ceph(=1)': ['LocalStorage'] },
    { 'LocalStorage(>=3) && Ceph(=1)': [] },
    { 'LocalStorage(=1) && NFS(=1)': [] },
    { 'LocalStorage(=1) && SharedMountPoint(=1)': [] },
    { 'SharedBlock(=1)': ['LocalStorage', 'NFS', 'SharedBlock', 'Ceph', 'CBD'] },
    { 'BlockStorage(=1)': ['LocalStorage', 'BlockStorage', 'Ceph'] },
    { 'SharedBlock(>1)': ['SharedBlock', 'Ceph', 'LocalStorage'] },
    { 'SharedBlock(>=1) && Ceph(=1)': ['SharedBlock'] },
    { 'BlockStorage(>1)': ['BlockStorage', 'Ceph'] },
    {
      [createExclusiveCondition(['LocalStorage', 'SharedBlock'])]: ['LocalStorage', 'SharedBlock']
    }
  ]
}

export function assert(realValue, oper, expectValue) {
  if (oper === '>') {
    return realValue > expectValue
  } else if (oper === '>=') {
    return realValue >= expectValue
  } else if (oper === '=') {
    return realValue === expectValue
  } else if (oper === '<=') {
    return realValue <= expectValue
  } else if (oper === '<') {
    return realValue < expectValue
  }
  return false
}

function compileRule(rule) {
  let result = {}
  for (const key in rule) {
    const rules = []
    const conditions = key.split('&&')
    for (const conditionStr of conditions) {
      const params = conditionStr.match(/\(.*?\)/g)
      if (params.length === 1) {
        const name = conditionStr.replace(params[0], '')
        const str = params[0].replace('(', '').replace(')', '')
        const oper = str.replace(/[0-9]/g, '')
        const value = str.replace(/[^0-9]/g, '')
        const singleRule = {
          name: name.trim(),
          oper: oper,
          value: parseInt(value)
        }
        rules.push(singleRule)
      }
    }
    result = {
      name: key,
      output: rule[key],
      rules: rules
    }
  }
  return result
}

export function compileRules(rules) {
  const result = []
  for (const rule of rules) {
    result.push(compileRule(rule))
  }
  return result
}

function getExistedTypes(existedRows) {
  const types = {}
  for (const type of PS_TYPES) {
    types[type] = 0
  }
  for (const row of existedRows) {
    if (row.type === 'Addon') {
      types[row.defaultProtocol]++
    } else {
      types[row.type]++
    }
  }
  return types
}

function doFilter(existedTypes, compiledRules) {
  const availablePsTypes = []
  for (const rule of compiledRules) {
    const childrenRules = rule.rules
    let isRight = true
    for (const childRule of childrenRules) {
      if (!assert(existedTypes[childRule.name], childRule.oper, childRule.value)) {
        isRight = false
        break
      }
    }
    if (isRight) {
      availablePsTypes.push(rule.output)
    }
  }
  if (availablePsTypes.length === 0) {
    return PS_TYPES
  }
  return _.intersection(...availablePsTypes)
}

export function getAvailablePsTypes(existedRows) {
  const existedTypes = getExistedTypes(existedRows)
  const compiledRules = compileRules(CLUSTER_PRIMARYSTORAGE.rules)
  return doFilter(existedTypes, compiledRules)
}
