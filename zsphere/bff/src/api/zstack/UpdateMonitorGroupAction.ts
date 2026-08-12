import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorGroupInventory } from "./types";

@Injectable()
export class UpdateMonitorGroupAction extends ActionAdvance {
  async call(
    params: UpdateMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateMonitorGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/monitorgroups/${params.uuid}/actions`,
      {
        updateMonitorGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateMonitorGroupResult>(
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

export interface UpdateMonitorGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  actions?: any[];
  stateEvent?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateMonitorGroupResult {
  inventory?: MonitorGroupInventory;
}
