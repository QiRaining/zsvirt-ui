import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSDingTalkEndpointInventory } from "./types";

@Injectable()
export class CreateSNSDingTalkEndpointAction extends ActionAdvance {
  async call(
    params: CreateSNSDingTalkEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSDingTalkEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSDingTalkEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/ding-talk`,
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
    return this.postAction<CreateSNSDingTalkEndpointResult>(
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

export interface CreateSNSDingTalkEndpointActionParam {
  url: string;
  atAll?: boolean;
  secret?: string;
  atPersonPhoneNumbers?: any[];
  atPersonList?: any;
  name: string;
  description?: string;
  platformUuid?: string;
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

export interface CreateSNSDingTalkEndpointResult {
  inventory?: SNSDingTalkEndpointInventory;
}
