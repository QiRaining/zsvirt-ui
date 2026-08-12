import * as _ from 'lodash'

import { ZsvRoleUIPrivilegeInput } from '../zsv-role.model'

// 与 ui transformUiPrivilege 对应
export function formateUiPrivilege(privileges: ZsvRoleUIPrivilegeInput[]) {
  const result: any = {}
  privileges.forEach((privilege: ZsvRoleUIPrivilegeInput) => {
    result[privilege.resourceType] = {
      ...privilege
    }
  })
  return result
}

export function formateUiPrivilegeByJson(privileges: any) {
  const result: any = {}
  _.keys(privileges).forEach((key: string) => {
    const config = key.split('||')
    if (!result?.[config[0]]) {
      result[config[0]] = {
        resourceType: config[0],
        effect: 'allow',
        views: [],
        actions: []
      }
    }
    if (config[1] === 'view') {
      result[config[0]].views.push(config[2])
    }
    if (config[1] === 'action') {
      result[config[0]].actions.push(config[2])
    }
  })
  return result
}

export function filterApis(existingStructure: string[], fullApis: string[]) {
  const existingPatterns = new Set(existingStructure)
  const result = []

  fullApis.forEach(api => {
    for (const pattern of existingPatterns) {
      if (pattern.endsWith('.**')) {
        const basePattern = pattern.slice(0, -2)
        if (api.startsWith(basePattern)) {
          result.push(api)
          break
        }
      } else if (api === pattern) {
        result.push(api)
        break
      }
    }
  })

  return result
}
