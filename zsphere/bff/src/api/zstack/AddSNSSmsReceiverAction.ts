import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSSmsReceiverInventory } from "./types";

@Injectable()
export class AddSNSSmsReceiverAction extends ActionAdvance {
  async call(
    params: AddSNSSmsReceiverActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSNSSmsReceiverResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSNSSmsReceiverAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/sms-endpoints/receivers`,
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
    return this.postAction<AddSNSSmsReceiverResult>(
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

export interface AddSNSSmsReceiverActionParam {
  phoneNumber: string;
  endpointUuid: string;
  type: string;
  description?: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddSNSSmsReceiverResult {
  inventory?: SNSSmsReceiverInventory;
}
