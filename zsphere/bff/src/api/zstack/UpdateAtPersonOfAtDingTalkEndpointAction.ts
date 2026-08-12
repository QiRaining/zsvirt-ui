import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSDingTalkAtPersonInventory } from "./types";

@Injectable()
export class UpdateAtPersonOfAtDingTalkEndpointAction extends ActionAdvance {
  async call(
    params: UpdateAtPersonOfAtDingTalkEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAtPersonOfDingTalkEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAtPersonOfAtDingTalkEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/sns/application-endpoints/ding-talk/at-persons/${params.uuid}/actions`,
      {
        updateAtPersonOfAtDingTalkEndpoint: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAtPersonOfDingTalkEndpointResult>(
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

export interface UpdateAtPersonOfAtDingTalkEndpointActionParam {
  uuid: string;
  endpointUuid: string;
  phoneNumber?: string;
  remark?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAtPersonOfDingTalkEndpointResult {
  inventory?: SNSDingTalkAtPersonInventory;
}
