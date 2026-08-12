import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ActionBase } from '@/api/zstack/base/action-base'
import { ZopsLongJob } from '@/model/zops-long-job.model'

@Injectable()
export class UpdateInspectionTaskReadStatusAction extends ActionBase {
  @InjectModel(ZopsLongJob) private zopsLongJob: typeof ZopsLongJob

  async call(
    param: UpdateInspectionTaskReadStatusActionParam
  ): Promise<UpdateInspectionTaskReadStatusResult> {
    const { readStatus, taskUuid } = param
    const rt = await this.zopsLongJob.update(
      {
        readStatus
      },
      { where: { longJobUuid: taskUuid } }
    )
    return rt
  }
}

export interface UpdateInspectionTaskReadStatusActionParam {
  taskUuid: string
  readStatus: 'READ' | 'UNREAD'
}

export interface UpdateInspectionTaskReadStatusResult {}
