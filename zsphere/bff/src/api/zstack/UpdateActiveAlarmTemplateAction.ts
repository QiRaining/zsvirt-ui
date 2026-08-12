import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ActiveAlarmTemplateInventory } from "./types";

@Injectable()
export class UpdateActiveAlarmTemplateAction extends ActionAdvance {
  async call(
    params: UpdateActiveAlarmTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateActiveAlarmTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateActiveAlarmTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/activealarms/templates/${params.uuid}/actions`,
      {
        updateActiveAlarmTemplate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateActiveAlarmTemplateResult>(
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

export interface UpdateActiveAlarmTemplateActionParam {
  uuid: string;
  alarmName?: string;
  comparisonOperator?: string;
  period?: number;
  threshold?: number;
  repeatInterval?: number;
  repeatCount?: number;
  emergencyLevel?: string;
  labels?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateActiveAlarmTemplateResult {
  inventory?: ActiveAlarmTemplateInventory;
}
