import { Injectable, Inject } from '@nestjs/common'

import { QueryMetricRuleTemplateAction } from '@/api/zstack/QueryMetricRuleTemplateAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import { QueryMetricRuleTemplateResp } from '@/maintenance/metric-rule-template/metric-rule-template.model'

@Injectable()
export class MetricRuleTemplateService {
  @Inject() queryMetricRuleTemplateAction: QueryMetricRuleTemplateAction

  async queryList(queryArg: IQueryAction): Promise<QueryMetricRuleTemplateResp> {
    const { inventories = [], total = 0 } = await this.queryMetricRuleTemplateAction.call(queryArg)

    return {
      list: inventories,
      total
    }
  }
}
