import { Injectable, Inject } from '@nestjs/common'

import { CheckStackTemplateParametersAction } from '@/api/zstack/CheckStackTemplateParametersAction'
import { GetResourceFromResourceStackAction } from '@/api/zstack/GetResourceFromResourceStackAction'
import { PreviewResourceStackAction } from '@/api/zstack/PreviewResourceStackAction'
import { QueryEventFromResourceStackAction } from '@/api/zstack/QueryEventFromResourceStackAction'
import { QueryResourceStackAction } from '@/api/zstack/QueryResourceStackAction'
import { QueryAction as IQueryAction } from '@/common/model/action-query.model'
import {
  PreviewResult,
  QueryResourceStackResp,
  PreviewResourceStackArgs,
  QueryEventFromResourceStackResp,
  CheckTemplateInput,
  CheckTemplateResp,
  PreviewResourceStruct,
  GetResourceFromResourceStackResp
} from '@/maintenance/resource-stack/resource-stack.model'

@Injectable()
export class ResourceStackService {
  @Inject() queryResourceStackAction: QueryResourceStackAction
  @Inject() previewResourceStackAction: PreviewResourceStackAction
  @Inject()
  queryEventFromResourceStackAction: QueryEventFromResourceStackAction
  @Inject()
  getResourceFromResourceStackAction: GetResourceFromResourceStackAction
  @Inject() checkTemplateAction: CheckStackTemplateParametersAction

  async queryList(queryArg: IQueryAction): Promise<QueryResourceStackResp> {
    const { inventories = [], total = 0 } = await this.queryResourceStackAction.call(queryArg)

    return {
      list: inventories,
      total
    }
  }

  async previewResourceStack(queryArg: PreviewResourceStackArgs): Promise<PreviewResult> {
    const {
      preview
    }: {
      preview?: PreviewResourceStruct
    } = await this.previewResourceStackAction.call(queryArg)
    if (preview) {
      preview.actions = preview.actions.map(cv => {
        cv.actions = JSON.stringify(cv.actions)
        return cv
      })
    }
    return { preview }
  }

  async queryEventFromResourceStackList(
    queryArg: IQueryAction
  ): Promise<QueryEventFromResourceStackResp> {
    const { inventories = [], total = 0 } =
      await this.queryEventFromResourceStackAction.call(queryArg)
    return {
      list: inventories,
      total
    }
  }

  async getResourceFromResourceStackList(uuid: string): Promise<GetResourceFromResourceStackResp> {
    const { resources } = await this.getResourceFromResourceStackAction.call({
      uuid
    })

    return {
      list: resources?.map(cv => {
        return {
          resourceType: Object.keys(cv)[0],
          name: Object.values<{ name: string }>(cv)[0].name,
          uuid: Object.values<{ uuid: string }>(cv)[0].uuid,
          createDate: Object.values<{ createDate: string }>(cv)[0].createDate
        }
      }),
      total: resources?.length
    }
  }

  async CheckTemplate(queryArg: CheckTemplateInput): Promise<CheckTemplateResp> {
    const { parameters } = await this.checkTemplateAction.call(queryArg)
    return {
      parameters
    }
  }
}
