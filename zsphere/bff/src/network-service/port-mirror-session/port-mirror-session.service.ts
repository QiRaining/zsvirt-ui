import { Injectable, Inject } from '@nestjs/common'

import { CreatePortMirrorSessionAction } from '@/api/zstack/CreatePortMirrorSessionAction'
import { QueryPortMirrorSessionAction } from '@/api/zstack/QueryPortMirrorSessionAction'
import { ActionService } from '@/base/action-service'
import { QueryAction } from '@/common/model/action-query.model'
import { QueryVmNicService } from '@/zsphere-resource/vm-nic/query/query.service'

@Injectable()
export class PortMirrorSessionService extends ActionService {
  @Inject() queryPortMirrorSessionAction: QueryPortMirrorSessionAction
  @Inject() createPortMirrorSessionAction: CreatePortMirrorSessionAction
  @Inject() queryVmNicService: QueryVmNicService

  async getPortMirrorSessionList(params: QueryAction) {
    const { inventories, total } = await this.queryPortMirrorSessionAction.call(params)
    return {
      list: inventories,
      total
    }
  }

  async getVmUuidsFromVMNics(params) {
    const { list } = await this.queryVmNicService.query(params)
    return { list }
  }
}
