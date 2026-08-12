import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccountGroupInventory } from "./types";

@Injectable()
export class CreateAccountGroupAction extends ActionAdvance {
  async call(
    params: CreateAccountGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAccountGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateAccountGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/account-groups`,
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
    return this.postAction<CreateAccountGroupResult>(
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

export interface CreateAccountGroupActionParam {
  name: string;
  description?: string;
  parentUuid?: string;
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

export interface CreateAccountGroupResult {
  inventory?: AccountGroupInventory;
}
