import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ConsoleInventory } from "./types";

@Injectable()
export class RequestConsoleAccessAction extends ActionAdvance {
  async call(
    params: RequestConsoleAccessActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RequestConsoleAccessResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RequestConsoleAccessAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/consoles`,
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
    return this.postAction<RequestConsoleAccessResult>(
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

export interface RequestConsoleAccessActionParam {
  vmInstanceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RequestConsoleAccessResult {
  inventory?: ConsoleInventory;
}
