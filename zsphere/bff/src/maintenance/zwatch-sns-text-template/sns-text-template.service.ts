import { Inject, Injectable } from '@nestjs/common'

import { QueryAliyunSmsSNSTextTemplateAction } from '@/api/zstack/QueryAliyunSmsSNSTextTemplateAction'
import { QuerySNSTextTemplateAction } from '@/api/zstack/QuerySNSTextTemplateAction'
import { QueryAction } from '@/common/model/action-query.model'

import {
  QueryAliyunSmsSNSTextTemplateResp,
  QuerySNSTextTemplateResp
} from './sns-text-template.model'

@Injectable()
export class SNSTextTemplateService {
  @Inject() private queryAction: QuerySNSTextTemplateAction
  @Inject() private queryAliyunAction: QueryAliyunSmsSNSTextTemplateAction

  async query(params: QueryAction): Promise<QuerySNSTextTemplateResp> {
    const { inventories, total } = await this.queryAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async queryAliyun(params: QueryAction): Promise<QueryAliyunSmsSNSTextTemplateResp> {
    const { inventories, total } = await this.queryAliyunAction.call(params)
    return {
      list: inventories,
      total
    }
  }
}
