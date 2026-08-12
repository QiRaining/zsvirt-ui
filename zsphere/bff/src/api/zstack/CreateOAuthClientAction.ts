import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { OAuth2ClientInventory } from "./types";

@Injectable()
export class CreateOAuthClientAction extends ActionAdvance {
  async call(
    params: CreateOAuthClientActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateOAuthClientResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateOAuthClientAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/create/oauth2/client`,
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
    return this.postAction<CreateOAuthClientResult>(
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

export interface CreateOAuthClientActionParam {
  name: string;
  description?: string;
  clientId: string;
  clientSecret?: string;
  authorizationUrl?: string;
  tokenUrl: string;
  userinfoUrl?: string;
  redirectUrl?: string;
  logoutUrl?: string;
  grantType: string;
  urlTemplate: string;
  usernameProperty?: string;
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

export interface CreateOAuthClientResult {
  inventory?: OAuth2ClientInventory;
}
