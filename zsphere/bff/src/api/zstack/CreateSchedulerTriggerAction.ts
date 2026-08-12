import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerTriggerInventory } from "./types";

@Injectable()
export class CreateSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: CreateSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSchedulerTriggerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/triggers`,
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
    return this.postAction<CreateSchedulerTriggerResult>(
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

export interface CreateSchedulerTriggerActionParam {
  name: string;
  description?: string;
  schedulerInterval?: number;
  repeatCount?: number;
  startTime?: number;
  stopTime?: number;
  schedulerType: string;
  cron?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateSchedulerTriggerResult {
  inventory?: SchedulerTriggerInventory;
}
