import { Injectable, Inject } from '@nestjs/common'
import { CONTEXT } from '@nestjs/graphql'
import * as _ from 'lodash'

import FlowConst from '@/common/flow/const'
import { FlowInstanceService } from '@/common/flow/flow-instance/flow-instance.service'
import { RecordActionService } from '@/common/record-action/record-action.service'

@Injectable()
export class DeleteVmInstanceActionHandlerService {
  @Inject(CONTEXT) private readonly context
  @Inject() flowInstanceService: FlowInstanceService
  @Inject() private recordActionService: RecordActionService

  protected getSessionId(): string {
    return this.context.req.headers['x-session-id']
  }

  async action(task) {
    const abortList = task.children.filter(
      subTask =>
        subTask.state === FlowConst.state.ABORTED || subTask.state === FlowConst.state.STOPPED
    )
    if (abortList.length === 0) {
      this.recordActionService.recordActionSuccess(task.mainJobId)
    } else if (abortList.length > 0 && abortList.length < task.children.length) {
      this.recordActionService.recordActionException(task.mainJobId)
    } else {
      this.recordActionService.recordActionFailed(task.mainJobId)
    }
  }
}
