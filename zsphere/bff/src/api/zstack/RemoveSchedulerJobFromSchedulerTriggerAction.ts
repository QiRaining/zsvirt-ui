import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSchedulerJobFromSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: RemoveSchedulerJobFromSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSchedulerJobFromSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSchedulerJobFromSchedulerTriggerAction.name,
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
      "schedulerJobUuid",
      "schedulerTriggerUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/scheduler/jobs/${params.schedulerJobUuid}/scheduler/triggers/${params.schedulerTriggerUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSchedulerJobFromSchedulerTriggerResult>(
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

export interface RemoveSchedulerJobFromSchedulerTriggerActionParam {
  schedulerJobUuid: string;
  schedulerTriggerUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveSchedulerJobFromSchedulerTriggerResult {}
