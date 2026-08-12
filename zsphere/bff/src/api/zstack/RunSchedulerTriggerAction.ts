import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RunSchedulerTriggerAction extends ActionAdvance {
  async call(
    params: RunSchedulerTriggerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RunSchedulerTriggerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RunSchedulerTriggerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scheduler/triggers/${params.uuid}/actions`,
      {
        runSchedulerTrigger: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RunSchedulerTriggerResult>(
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

export interface RunSchedulerTriggerActionParam {
  uuid: string;
  jobUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RunSchedulerTriggerResult {}
