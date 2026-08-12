import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { TelemetryConsentInventory } from "./GetTelemetryConsentAction";

export enum TelemetryConsentActionValue {
  Enabled = "Enabled",
  Disabled = "Disabled",
}

@Injectable()
export class UpdateTelemetryConsentAction extends ActionAdvance {
  async call(
    params: UpdateTelemetryConsentActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateTelemetryConsentResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateTelemetryConsentAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      "/telemetry/consent",
      {
        updateTelemetryConsent: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateTelemetryConsentResult>(
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

export interface UpdateTelemetryConsentActionParam {
  action: TelemetryConsentActionValue;
  agreedToTerms?: boolean;
  systemTags?: unknown[];
  userTags?: unknown[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateTelemetryConsentResult {
  inventory?: TelemetryConsentInventory;
}
