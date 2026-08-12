import { Inject, Injectable } from '@nestjs/common'
import * as _ from 'lodash'

import {
  GetTaskProgressAction,
  GetTaskProgressActionParam
} from '@/api/zstack/GetTaskProgressAction'

import {
  QueryTaskProgressArgs,
  TaskProgressList,
  TaskProgressQueryType
} from './task-progress.model'

@Injectable()
export class TaskProgressQueryService {
  @Inject() getTaskProgressAction: GetTaskProgressAction

  async getTaskProgress(params: QueryTaskProgressArgs) {
    const { type = TaskProgressQueryType.NORMAL } = params

    let resolve: TaskProgressList = {
      list: [],
      total: 0
    }

    switch (type) {
      case TaskProgressQueryType.NORMAL:
        resolve = await this.getLongJobTaskProgressList(params)
        break

      default:
        break
    }

    return resolve
  }

  async getLongJobTaskProgressList(payload: GetTaskProgressActionParam): Promise<TaskProgressList> {
    const { inventories = [] } = await this.getTaskProgressAction.call({
      apiId: payload?.apiId,
      all: payload?.all,
      systemTags: payload?.systemTags,
      userTags: payload?.userTags
    })

    return {
      list: inventories,
      total: inventories?.length
    }
  }
}
