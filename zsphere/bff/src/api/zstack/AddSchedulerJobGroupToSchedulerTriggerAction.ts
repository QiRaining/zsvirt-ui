import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobGroupSchedulerTriggerRefInventory } from "./types";

@Injectable()
export class AddSchedulerJobGroupToSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: AddSchedulerJobGroupToSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSchedulerJobGroupToSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSchedulerJobGroupToSchedulerTriggerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/jobgroups/${params.schedulerJobGroupUuid}/scheduler/triggers/${params.schedulerTriggerUuid}`,
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
    return this.postAction<AddSchedulerJobGroupToSchedulerTriggerResult>(
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

export interface AddSchedulerJobGroupToSchedulerTriggerActionParam {
  schedulerJobGroupUuid: string;
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

export interface AddSchedulerJobGroupToSchedulerTriggerResult {
  inventory?: SchedulerJobGroupSchedulerTriggerRefInventory;
}
