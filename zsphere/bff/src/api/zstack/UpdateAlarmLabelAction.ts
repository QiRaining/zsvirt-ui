import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlarmLabelInventory } from "./types";

@Injectable()
export class UpdateAlarmLabelAction extends ActionAdvance {
  async call(
    params: UpdateAlarmLabelActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAlarmLabelResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAlarmLabelAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alarms/labels/${params.uuid}/actions`,
      {
        updateAlarmLabel: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAlarmLabelResult>(
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

export interface UpdateAlarmLabelActionParam {
  uuid: string;
  key: string;
  value: string;
  operator: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAlarmLabelResult {
  inventory?: AlarmLabelInventory;
}
