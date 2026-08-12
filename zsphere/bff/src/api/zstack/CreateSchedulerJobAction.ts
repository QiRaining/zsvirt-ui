import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobInventory } from "./types";

@Injectable()
export class CreateSchedulerJobAction extends ActionAdvance {
  async call(
    params: CreateSchedulerJobActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSchedulerJobResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSchedulerJobAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/jobs`,
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
    return this.postAction<CreateSchedulerJobResult>(
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

export interface CreateSchedulerJobActionParam {
  name: string;
  description?: string;
  targetResourceUuid: string;
  type: string;
  parameters?: any;
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

export interface CreateSchedulerJobResult {
  inventory?: SchedulerJobInventory;
}
