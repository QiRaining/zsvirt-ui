import { Injectable, Inject } from '@nestjs/common'

import { QueryPortMirrorAction } from '@/api/zstack/QueryPortMirrorAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'

@Injectable()
export class PortMirrorService extends ActionService {
  @Inject() queryPortMirrorAction: QueryPortMirrorAction

  // transform(item: PortMirror) {
  //   item.state = item.state.toLowerCase()
  //   return item
  // }
  async getPortMirrorList(params: QueryAction) {
    const { inventories, total } = await this.queryPortMirrorAction.call(params)
    // const portMirrors: PortMirror[] = inventories.map(item => {
    //   return this.transform(item)
    // })
    return {
      list: inventories,
      total
    }
  }
}
