import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlarmInventory } from "./types";

@Injectable()
export class AddActionToAlarmAction extends ActionAdvance {
  async call(
    params: AddActionToAlarmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddActionToAlarmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddActionToAlarmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/alarms/${params.alarmUuid}/actions`,
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
    return this.postAction<AddActionToAlarmResult>(
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

export interface AddActionToAlarmActionParam {
  alarmUuid: string;
  actionUuid: string;
  actionType: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddActionToAlarmResult {
  inventory?: AlarmInventory;
}
