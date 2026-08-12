import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlarmInventory } from "./types";

@Injectable()
export class UpdateAlarmAction extends ActionAdvance {
  async call(
    params: UpdateAlarmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAlarmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAlarmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alarms/${params.uuid}/actions`,
      {
        updateAlarm: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAlarmResult>(
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

export interface UpdateAlarmActionParam {
  uuid: string;
  name?: string;
  description?: string;
  comparisonOperator?: string;
  period?: number;
  threshold?: number;
  repeatInterval?: number;
  repeatCount?: number;
  enableRecovery?: boolean;
  emergencyLevel?: string;
  actions?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAlarmResult {
  inventory?: AlarmInventory;
}
