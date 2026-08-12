import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SchedulerJobGroupInventory } from "./types";

@Injectable()
export class UpdateSchedulerJobGroupAction extends ActionAdvance {
  async call(
    params: UpdateSchedulerJobGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSchedulerJobGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSchedulerJobGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/scheduler/jobgroups/${params.uuid}/actions`,
      {
        updateSchedulerJobGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSchedulerJobGroupResult>(
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

export interface UpdateSchedulerJobGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  state?: string;
  parameters?: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSchedulerJobGroupResult {
  inventory?: SchedulerJobGroupInventory;
}
