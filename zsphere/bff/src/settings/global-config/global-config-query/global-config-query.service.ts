import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { compact as _compact, forEach as _forEach, get as _get } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'
import { ZQLService } from '@/api/zstack/base/zql-query'
import { QueryGlobalConfigAction } from '@/api/zstack/QueryGlobalConfigAction'
import { Condition as ICondition } from '@/common/model/action-query.model'
import ZQL, { QueryConditionTranslator } from '@/common/zql/index'
import { ZqlObject } from '@/common/zql/zqlBuilder'
import { ZsUIConfig } from '@/model/zs-ui-config.model'

import { GlobalConfigQueryType, QueryGlobalConfigArgs } from '../global-config.model'

@Injectable()
export class GlobalConfigQueryService {
  @Inject() zqlService: ZQLService
  @Inject() queryGlobalConfigAction: QueryGlobalConfigAction
  @InjectModel(ZsUIConfig) private zsUIConfig: typeof ZsUIConfig

  async globalConfig(category, name) {
    const conditions: ICondition[] = [
      {
        key: 'category',
        op: Op.eq,
        value: category
      },
      {
        key: 'name',
        op: Op.eq,
        value: name
      }
    ]
    const zqlCondition = this.buildZqlCondition(conditions)

    const zqlObject = {
      tableName: 'GlobalConfig',
      condition: zqlCondition
    }
    const zql = ZQL.stringify(zqlObject)
    let results
    if (category !== 'ui') {
      results = (await this.zqlService.call(zql)).results
    }
    let resp
    try {
      resp = await this.zsUIConfig.findOne({
        where: {
          name: name
        }
      })
    } catch (e) {
      console.error(e)
    }
    const getGlobalConfigs = results?.[0]?.inventories?.[0] ?? undefined
    if (!getGlobalConfigs && !resp?.dataValues) {
      return null
    }

    const result = {
      ...resp?.dataValues,
      ...getGlobalConfigs
    }

    result.category = result?.category ? result?.category : 'ui'

    return {
      ...result,
      uuid: `${result.category}.${result.name}`
    }
  }

  async getGlobalConfig(category, name) {
    const conditions: ICondition[] = [
      {
        key: 'category',
        op: Op.eq,
        value: category
      },
      {
        key: 'name',
        op: Op.eq,
        value: name
      }
    ]
    const params = {
      conditions: conditions
    }

    let results
    if (category !== 'ui') {
      results = await this.queryGlobalConfigAction.call(params)
    }
    let resp
    try {
      resp = await this.zsUIConfig.findOne({
        where: {
          name: name
        }
      })
    } catch (e) {
      console.error(e)
    }
    const getGlobalConfigs = results?.inventories?.[0] ?? undefined

    if (!getGlobalConfigs && !resp?.dataValues) {
      return null
    }

    const result = {
      ...resp?.dataValues,
      ...getGlobalConfigs
    }

    result.category = result?.category ? result?.category : 'ui'

    return {
      ...result,
      uuid: `${result.category}.${result.name}`
    }
  }

  async queryList(params: QueryGlobalConfigArgs) {
    const { type = GlobalConfigQueryType.Normal } = params

    let _extrazqlConditions
    switch (type) {
      case GlobalConfigQueryType.Normal:
        break
    }

    const zqlCondition = this.buildZqlCondition(params.conditions, _extrazqlConditions)

    const zqlObject = {
      tableName: 'GlobalConfig',
      condition: zqlCondition,
      orderBy: params.sortBy,
      orderDirection: params.sortDirection,
      limit: params.limit,
      offset: params.start,
      returnWith: {
        total: true
      }
    }

    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    let resp
    if (params.includeUiConfig !== false) {
      try {
        resp = await this.zsUIConfig.findAll()
      } catch (e) {
        console.error(e)
      }
    }

    const getGlobalConfigs = results?.[0]?.inventories ?? []

    _forEach(resp, uiConfig => {
      if (uiConfig?.dataValues) {
        getGlobalConfigs.push({
          ...uiConfig.dataValues,
          category: 'ui'
        })
      }
    })

    const total = _get(getGlobalConfigs, 'length', 0)

    return {
      list: getGlobalConfigs,
      total: total
    }
  }
  async queryGlobalConfigCpuMode() {
    const conditions: ICondition[] = [
      {
        key: 'category',
        op: Op.eq,
        value: 'kvm'
      },
      {
        key: 'name',
        op: Op.eq,
        value: 'vm.cpuMode'
      }
    ]
    const zqlCondition = this.buildZqlCondition(conditions)

    const zqlObject = {
      tableName: 'GlobalConfig',
      condition: zqlCondition
    }
    const zql = ZQL.stringify(zqlObject)
    const { results } = await this.zqlService.call(zql)
    return {
      cpuMode: results?.[0]?.inventories?.[0]?.value
    }
  }
  buildZqlCondition(conditions: ICondition[], extrazqlConditions?: ZqlObject['condition']) {
    const specicalCondition = []

    // conditions 为移除特殊key的conditions
    const zqlCondition = QueryConditionTranslator.translate(
      conditions,
      _compact(specicalCondition.concat(extrazqlConditions))
    )

    return zqlCondition
  }
}
