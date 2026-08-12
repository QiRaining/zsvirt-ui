import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSchedulerJobsFromSchedulerJobGroupAction extends ActionAdvance {
  async call(
    params: RemoveSchedulerJobsFromSchedulerJobGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSchedulerJobsFromSchedulerJobGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSchedulerJobsFromSchedulerJobGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "schedulerJobGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/scheduler/jobgroups/${params.schedulerJobGroupUuid}/job${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSchedulerJobsFromSchedulerJobGroupResult>(
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

export interface RemoveSchedulerJobsFromSchedulerJobGroupActionParam {
  schedulerJobGroupUuid: string;
  schedulerJobUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveSchedulerJobsFromSchedulerJobGroupResult {}
