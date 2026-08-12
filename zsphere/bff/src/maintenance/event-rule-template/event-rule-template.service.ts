import { Injectable, Inject } from '@nestjs/common'

import { QueryEventRuleTemplateAction } from '@/api/zstack/QueryEventRuleTemplateAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { QueryEventRuleTemplateResp } from '@/maintenance/event-rule-template/event-rule-template.model'

@Injectable()
export class EventRuleTemplateService {
  @Inject() queryEventRuleTemplateAction: QueryEventRuleTemplateAction

  async queryList(queryArg: IQueryAction): Promise<QueryEventRuleTemplateResp> {
    const { inventories = [], total = 0 } = await this.queryEventRuleTemplateAction.call(queryArg)
    inventories.forEach(item => {
      item.labels = item.labels ? JSON.parse(item.labels) : []
    })
    return {
      list: inventories,
      total
    }
  }
}
