import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AlertDataAckInventory } from "./types";

@Injectable()
export class AckEventDataAction extends ActionAdvance {
  async call(
    params: AckEventDataActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AckAlertDataResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AckEventDataAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zwatch/event-histories/acknowledgments`,
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
    return this.postAction<AckAlertDataResult>(
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

export interface AckEventDataActionParam {
  eventSubscriptionUuid: string;
  alertDataUuid: string;
  dataType: string;
  resourceUuid?: string;
  ackPeriodSec: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AckAlertDataResult {
  inventory?: AlertDataAckInventory;
}
