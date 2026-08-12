import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetTelemetryConsentAction extends QueryAdvance {
  async call(
    params: GetTelemetryConsentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetTelemetryConsentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetTelemetryConsentAction.name,
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
      `/telemetry/consent${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetTelemetryConsentResult>(
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

export interface GetTelemetryConsentActionParam {
  systemTags?: unknown[];
  userTags?: unknown[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface TelemetryConsentInventory {
  consentGrantedAt: string;
}

export interface GetTelemetryConsentResult {
  inventory: TelemetryConsentInventory;
}
