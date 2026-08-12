import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SessionInventory } from "./types";

@Injectable()
export class LogInAction extends ActionAdvance {
  async call(
    params: LogInActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LogInResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      LogInAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/login`,
      {
        logIn: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<LogInResult>(
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

export interface LogInActionParam {
  username: string;
  password: string;
  loginType: string;
  captchaUuid?: string;
  verifyCode?: string;
  clientInfo?: any;
  properties?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface LogInResult {
  inventory?: SessionInventory;
}
