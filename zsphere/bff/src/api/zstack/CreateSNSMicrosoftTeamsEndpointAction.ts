import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SNSMicrosoftTeamsEndpointInventory } from "./types";

@Injectable()
export class CreateSNSMicrosoftTeamsEndpointAction extends ActionAdvance {
  async call(
    params: CreateSNSMicrosoftTeamsEndpointActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateSNSMicrosoftTeamsEndpointResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateSNSMicrosoftTeamsEndpointAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/sns/application-endpoints/microsoft-teams`,
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
    return this.postAction<CreateSNSMicrosoftTeamsEndpointResult>(
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

export interface CreateSNSMicrosoftTeamsEndpointActionParam {
  url: string;
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

export interface CreateSNSMicrosoftTeamsEndpointResult {
  inventory?: SNSMicrosoftTeamsEndpointInventory;
}
