import { Injectable, Inject } from '@nestjs/common'
import DataLoader from 'dataloader'
import { get as _get, reduce as _reduce } from 'lodash'

import { Op } from '@/api/zstack/base/query-base'

import { GlobalConfigTemplateQueryService } from './global-config-template-query/global-config-template-query.service'

@Injectable()
export class GlobalConfigTemplateDataloader {
  @Inject() globalConfigTemplateQueryService: GlobalConfigTemplateQueryService

  private globalConfigTemplateDataloader

  constructor() {
    this.globalConfigTemplateDataloader = new DataLoader(this._query)
  }

  query(templateUuid) {
    return this.globalConfigTemplateDataloader.load(templateUuid)
  }

  _query = async (uuids: string[]) => {
    const params = {
      conditions: [{ key: 'uuid', op: Op.in, values: uuids }],
      start: 0,
      limit: 1000
    }
    const resp = await this.globalConfigTemplateQueryService.queryList(params)
    const globalConfigTemplates = _reduce(
      _get(resp, 'list', []),
      (obj, item) => {
        obj[item.uuid] = item
        return obj
      },
      {}
    )

    return uuids.map(uuid => {
      return _get(globalConfigTemplates, uuid, null)
    })
  }
}
