import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccountGroupInventory } from "./types";

@Injectable()
export class UpdateAccountGroupAction extends ActionAdvance {
  async call(
    params: UpdateAccountGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAccountGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAccountGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/account-groups/${params.uuid}/actions`,
      {
        updateAccountGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAccountGroupResult>(
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

export interface UpdateAccountGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAccountGroupResult {
  inventory?: AccountGroupInventory;
}
