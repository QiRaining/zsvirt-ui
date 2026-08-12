import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccountResourceRefInventory } from "./types";

@Injectable()
export class ChangeResourceOwnerAction extends ActionAdvance {
  async call(
    params: ChangeResourceOwnerActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeResourceOwnerResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeResourceOwnerAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/account/${params.accountUuid}/resources`,
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
    return this.postAction<ChangeResourceOwnerResult>(
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

export interface ChangeResourceOwnerActionParam {
  accountUuid: string;
  resourceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeResourceOwnerResult {
  inventory?: AccountResourceRefInventory;
}
