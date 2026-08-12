import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RemoveSNSSmsReceiverAction extends ActionAdvance {
  async call(
    params: RemoveSNSSmsReceiverActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveSNSSmsReceiverResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveSNSSmsReceiverAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "endpointUuid",
      "phoneNumber",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/sns/sms-endpoints/${params.endpointUuid}/receivers/${params.phoneNumber}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveSNSSmsReceiverResult>(
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

export interface RemoveSNSSmsReceiverActionParam {
  endpointUuid: string;
  phoneNumber: string;
  deleteMode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveSNSSmsReceiverResult {}
