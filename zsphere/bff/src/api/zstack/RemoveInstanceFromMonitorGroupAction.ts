import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveInstanceFromMonitorGroupAction extends ActionAdvance {
  async call(
    params: RemoveInstanceFromMonitorGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveInstanceFromMonitorGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveInstanceFromMonitorGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "groupUuid",
      "instanceUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/zwatch/monitorgroups/${params.groupUuid}/actions/${params.instanceUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveInstanceFromMonitorGroupResult>(
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

export interface RemoveInstanceFromMonitorGroupActionParam {
  groupUuid: string;
  instanceUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveInstanceFromMonitorGroupResult {}
