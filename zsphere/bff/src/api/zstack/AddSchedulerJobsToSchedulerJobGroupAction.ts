import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddSchedulerJobsToSchedulerJobGroupAction extends ActionAdvance {
  async call(
    params: AddSchedulerJobsToSchedulerJobGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSchedulerJobsToSchedulerJobGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSchedulerJobsToSchedulerJobGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/jobgroups/${params.schedulerJobGroupUuid}/job`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddSchedulerJobsToSchedulerJobGroupResult>(
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
      httpRequestPromise,
      needRecord,
      apiRecord,
    );
  }
}

export interface AddSchedulerJobsToSchedulerJobGroupActionParam {
  schedulerJobGroupUuid: string;
  schedulerJobUuids: any[];
  priorities?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddSchedulerJobsToSchedulerJobGroupResult {
  inventories?: any[];
}
