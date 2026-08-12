import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobSchedulerTriggerInventory } from "./types";

@Injectable()
export class AddSchedulerJobToSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: AddSchedulerJobToSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSchedulerJobToSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSchedulerJobToSchedulerTriggerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/jobs/${params.schedulerJobUuid}/scheduler/triggers/${params.schedulerTriggerUuid}`,
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
    return this.postAction<AddSchedulerJobToSchedulerTriggerResult>(
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

export interface AddSchedulerJobToSchedulerTriggerActionParam {
  schedulerJobUuid: string;
  schedulerTriggerUuid: string;
  triggerNow?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddSchedulerJobToSchedulerTriggerResult {
  inventory?: SchedulerJobSchedulerTriggerInventory;
}
