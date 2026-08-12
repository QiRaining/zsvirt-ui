import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccountInventory } from "./types";

@Injectable()
export class CreateAccountAction extends ActionAdvance {
  async call(
    params: CreateAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAccountAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/accounts`,
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
    return this.postAction<CreateAccountResult>(
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

export interface CreateAccountActionParam {
  name: string;
  password: string;
  type?: string;
  state?: string;
  description?: string;
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

export interface CreateAccountResult {
  inventory?: AccountInventory;
}
