import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobInventory } from "./types";

@Injectable()
export class UpdateSchedulerJobAction extends ActionAdvance {
  async call(
    params: UpdateSchedulerJobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSchedulerJobResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSchedulerJobAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scheduler/jobs/${params.uuid}/actions`,
      {
        updateSchedulerJob: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSchedulerJobResult>(
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

export interface UpdateSchedulerJobActionParam {
  uuid: string;
  name?: string;
  description?: string;
  parameters?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSchedulerJobResult {
  inventory?: SchedulerJobInventory;
}
