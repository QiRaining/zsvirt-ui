import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, map as _map, reduce as _reduce } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'

import { GlobalConfigQueryService } from './global-config-query/global-config-query.service'

@Injectable()
export class GlobalConfigDataloader {
  @Inject() globalConfigQueryService: GlobalConfigQueryService

  private globalConfigDataloader

  private globalConfigMap: any = {}

  constructor() {
    this.globalConfigDataloader = new DataLoader(this._query)
  }

  query(name, category) {
    this.globalConfigMap[`${name}.${category}`] = {
      name,
      category
    }
    return this.globalConfigDataloader.load(`${name}.${category}`)
  }

  _query = async (list: string[]) => {
    const names = _map(list, it => _get(this.globalConfigMap, [it, 'name'], ''))
    const categorys = _map(list, it => _get(this.globalConfigMap, [it, 'category'], ''))
    const params = {
      conditions: [
        { key: 'name', op: Op.in, values: names },
        { key: 'category', op: Op.in, values: categorys }
      ],
      start: 0,
      limit: 1000
    }
    const resp = await this.globalConfigQueryService.queryList(params)
    const globalConfigs = _reduce(
      _get(resp, 'list', []),
      (obj, item) => {
        obj[`${item.name}.${item.category}`] = item
        return obj
      },
      {}
    )

    return list.map(it => {
      return _get(globalConfigs, it, null)
    })
  }
}
