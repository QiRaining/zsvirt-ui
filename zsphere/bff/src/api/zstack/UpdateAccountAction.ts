import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccountInventory } from "./types";

@Injectable()
export class UpdateAccountAction extends ActionAdvance {
  async call(
    params: UpdateAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAccountResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAccountAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/accounts/${params.uuid}`,
      {
        updateAccount: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAccountResult>(
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

export interface UpdateAccountActionParam {
  uuid: string;
  password?: string;
  name?: string;
  description?: string;
  oldPassword?: string;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAccountResult {
  inventory?: AccountInventory;
}
