import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckTelemetryUpdateAction extends ActionAdvance {
  async call(
    params: CheckTelemetryUpdateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckTelemetryUpdateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckTelemetryUpdateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      "/telemetry/updates/check",
      {
        checkTelemetryUpdate: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CheckTelemetryUpdateResult>(
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

export interface CheckTelemetryUpdateActionParam {
  systemTags?: unknown[];
  userTags?: unknown[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface TelemetryUpdateInfoView {
  version?: string;
  releaseNotesZh?: string;
  releaseNotesEn?: string;
  currentVersion?: string;
}

export interface CheckTelemetryUpdateResult {
  inventory?: TelemetryUpdateInfoView;
}
