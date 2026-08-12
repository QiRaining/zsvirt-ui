import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSDingTalkAtPersonInventory } from "./types";

@Injectable()
export class AddSNSDingTalkAtPersonAction extends ActionAdvance {
  async call(
    params: AddSNSDingTalkAtPersonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSNSDingTalkAtPersonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSNSDingTalkAtPersonAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/ding-talk/at-persons`,
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
    return this.postAction<AddSNSDingTalkAtPersonResult>(
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

export interface AddSNSDingTalkAtPersonActionParam {
  phoneNumber: string;
  endpointUuid: string;
  remark?: string;
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

export interface AddSNSDingTalkAtPersonResult {
  inventory?: SNSDingTalkAtPersonInventory;
}
