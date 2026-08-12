import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlarmInventory } from "./types";

@Injectable()
export class CreateAlarmAction extends ActionAdvance {
  async call(
    params: CreateAlarmActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAlarmResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAlarmAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/alarms`,
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
    return this.postAction<CreateAlarmResult>(
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

export interface CreateAlarmActionParam {
  name: string;
  description?: string;
  comparisonOperator: string;
  period?: number;
  namespace: string;
  metricName: string;
  threshold: number;
  repeatInterval?: number;
  labels?: any[];
  actions?: any[];
  repeatCount?: number;
  type?: string;
  enableRecovery?: boolean;
  emergencyLevel?: string;
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

export interface CreateAlarmResult {
  inventory?: AlarmInventory;
}
