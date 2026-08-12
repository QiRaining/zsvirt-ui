import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobGroupInventory } from "./types";

@Injectable()
export class CreateSchedulerJobGroupAction extends ActionAdvance {
  async call(
    params: CreateSchedulerJobGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSchedulerJobGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSchedulerJobGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/scheduler/jobgroups`,
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
    return this.postAction<CreateSchedulerJobGroupResult>(
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

export interface CreateSchedulerJobGroupActionParam {
  name: string;
  description?: string;
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

export interface CreateSchedulerJobGroupResult {
  inventory?: SchedulerJobGroupInventory;
}
