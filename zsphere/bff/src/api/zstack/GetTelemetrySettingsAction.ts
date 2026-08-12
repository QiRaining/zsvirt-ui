import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetTelemetrySettingsAction extends QueryAdvance {
  async call(
    params: GetTelemetrySettingsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetTelemetrySettingsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetTelemetrySettingsAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/telemetry/settings${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetTelemetrySettingsResult>(
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

export interface GetTelemetrySettingsActionParam {
  systemTags?: unknown[];
  userTags?: unknown[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface TelemetrySettingInventory {
  descriptionKey: string;
  privacyPolicyUrl: string;
}

export interface GetTelemetrySettingsResult {
  inventory: TelemetrySettingInventory;
}
