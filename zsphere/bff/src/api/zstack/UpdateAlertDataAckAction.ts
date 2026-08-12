import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlertDataAckInventory } from "./types";

@Injectable()
export class UpdateAlertDataAckAction extends ActionAdvance {
  async call(
    params: UpdateAlertDataAckActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAlertDataAckResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAlertDataAckAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/zwatch/alert-histories/acknowledgments/${params.alertDataUuid}/actions`,
      {
        updateAlertDataAck: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAlertDataAckResult>(
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

export interface UpdateAlertDataAckActionParam {
  alertDataUuid: string;
  resumeAlert?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAlertDataAckResult {
  inventory?: AlertDataAckInventory;
}
