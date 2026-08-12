import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SSORedirectTemplateInventory } from "./types";

@Injectable()
export class UpdateSSORedirectTemplateAction extends ActionAdvance {
  async call(
    params: UpdateSSORedirectTemplateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSSORedirectTemplateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSSORedirectTemplateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/update/sso/redirectTemplate`,
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
    return this.postAction<UpdateSSORedirectTemplateResult>(
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

export interface UpdateSSORedirectTemplateActionParam {
  uuid: string;
  redirectTemplate: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSSORedirectTemplateResult {
  inventory?: SSORedirectTemplateInventory;
}
