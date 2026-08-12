import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorGroupInventory } from "./types";

@Injectable()
export class CreateMonitorGroupAction extends ActionAdvance {
  async call(
    params: CreateMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateMonitorGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitorgroups`,
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
    return this.postAction<CreateMonitorGroupResult>(
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

export interface CreateMonitorGroupActionParam {
  name: string;
  description?: string;
  actions?: any[];
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

export interface CreateMonitorGroupResult {
  inventory?: MonitorGroupInventory;
}
