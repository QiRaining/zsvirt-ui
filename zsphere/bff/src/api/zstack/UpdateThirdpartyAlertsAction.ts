import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class UpdateThirdpartyAlertsAction extends ActionAdvance {
  async call(
    params: UpdateThirdpartyAlertsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateThirdpartyAlertsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateThirdpartyAlertsAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/third-party/alerts/actions`,
      {
        updateThirdpartyAlerts: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateThirdpartyAlertsResult>(
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

export interface UpdateThirdpartyAlertsActionParam {
  uuid?: string;
  startTimeMillis?: number;
  endTimeMillis?: number;
  updateReadStatus?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateThirdpartyAlertsResult {}
