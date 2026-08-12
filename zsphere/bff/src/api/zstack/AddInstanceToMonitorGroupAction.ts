import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { MonitorGroupInstanceInventory } from "./types";

@Injectable()
export class AddInstanceToMonitorGroupAction extends ActionAdvance {
  async call(
    params: AddInstanceToMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddInstanceToMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddInstanceToMonitorGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/monitorgroups/${params.groupUuid}/actions`,
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
    return this.postAction<AddInstanceToMonitorGroupResult>(
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

export interface AddInstanceToMonitorGroupActionParam {
  instanceUuid: string;
  groupUuid: string;
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

export interface AddInstanceToMonitorGroupResult {
  inventory?: MonitorGroupInstanceInventory;
}
