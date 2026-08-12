import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CasClientInventory } from "./types";

@Injectable()
export class UpdateCasClientAction extends ActionAdvance {
  async call(
    params: UpdateCasClientActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateCasClientResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateCasClientAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/update/cas/client`,
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
    return this.postAction<UpdateCasClientResult>(
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

export interface UpdateCasClientActionParam {
  uuid: string;
  description?: string;
  name?: string;
  casServerLoginUrl?: string;
  casServerUrlPrefix?: string;
  serverName?: string;
  usernameProperty?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateCasClientResult {
  inventory?: CasClientInventory;
}
