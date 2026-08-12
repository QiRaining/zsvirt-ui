import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ZStoneInventory } from "./types";

@Injectable()
export class AddZStoneAction extends ActionAdvance {
  async call(
    params: AddZStoneActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddZStoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddZStoneAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zstone-plugin`,
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
    return this.postAction<AddZStoneResult>(
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

export interface AddZStoneActionParam {
  name: string;
  username?: string;
  password?: string;
  managementIp: string;
  logInPort?: number;
  apiPort?: number;
  logInUrl?: string;
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

export interface AddZStoneResult {
  inventory?: ZStoneInventory;
}
