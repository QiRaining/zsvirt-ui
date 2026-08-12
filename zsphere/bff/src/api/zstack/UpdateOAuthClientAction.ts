import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { OAuth2ClientInventory } from "./types";

@Injectable()
export class UpdateOAuthClientAction extends ActionAdvance {
  async call(
    params: UpdateOAuthClientActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateOAuthClientResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateOAuthClientAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/update/oauth2/client`,
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
    return this.postAction<UpdateOAuthClientResult>(
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

export interface UpdateOAuthClientActionParam {
  uuid: string;
  name?: string;
  description?: string;
  clientId?: string;
  clientSecret?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  redirectUrl?: string;
  userinfoUrl?: string;
  logoutUrl?: string;
  usernameProperty?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateOAuthClientResult {
  inventory?: OAuth2ClientInventory;
}
