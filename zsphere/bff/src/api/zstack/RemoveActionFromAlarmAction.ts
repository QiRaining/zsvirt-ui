import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlarmInventory } from "./types";

@Injectable()
export class RemoveActionFromAlarmAction extends ActionAdvance {
  async call(
    params: RemoveActionFromAlarmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveActionFromAlarmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveActionFromAlarmAction.name,
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
      "alarmUuid",
      "actionUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/zwatch/alarms/${params.alarmUuid}/actions/${params.actionUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveActionFromAlarmResult>(
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

export interface RemoveActionFromAlarmActionParam {
  alarmUuid: string;
  actionUuid: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveActionFromAlarmResult {
  inventory?: AlarmInventory;
}
