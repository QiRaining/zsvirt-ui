import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CasClientInventory } from "./types";

@Injectable()
export class CreateCasClientAction extends ActionAdvance {
  async call(
    params: CreateCasClientActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateCasClientResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateCasClientAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/create/cas/client`,
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
    return this.postAction<CreateCasClientResult>(
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

export interface CreateCasClientActionParam {
  name: string;
  description?: string;
  casServerLoginUrl: string;
  casServerUrlPrefix: string;
  serverName: string;
  usernameProperty?: string;
  urlTemplate?: string;
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

export interface CreateCasClientResult {
  inventory?: CasClientInventory;
}
