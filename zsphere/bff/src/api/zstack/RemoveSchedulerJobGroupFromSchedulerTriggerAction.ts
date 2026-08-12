import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSchedulerJobGroupFromSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: RemoveSchedulerJobGroupFromSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSchedulerJobGroupFromSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSchedulerJobGroupFromSchedulerTriggerAction.name,
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
      "schedulerTriggerUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/scheduler/jobgroups/${params.schedulerJobGroupUuid}/scheduler/triggers/${params.schedulerTriggerUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSchedulerJobGroupFromSchedulerTriggerResult>(
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

export interface RemoveSchedulerJobGroupFromSchedulerTriggerActionParam {
  schedulerJobGroupUuid: string;
  schedulerTriggerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveSchedulerJobGroupFromSchedulerTriggerResult {}
