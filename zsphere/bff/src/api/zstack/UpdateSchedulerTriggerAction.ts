import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerTriggerInventory } from "./types";

@Injectable()
export class UpdateSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: UpdateSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSchedulerTriggerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scheduler/triggers/${params.uuid}/actions`,
      {
        updateSchedulerTrigger: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSchedulerTriggerResult>(
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

export interface UpdateSchedulerTriggerActionParam {
  uuid: string;
  name?: string;
  description?: string;
  schedulerInterval?: number;
  repeatCount?: number;
  startTime?: number;
  stopTime?: number;
  cron?: string;
  schedulerType?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSchedulerTriggerResult {
  inventory?: SchedulerTriggerInventory;
}
