import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SessionInventory } from "./types";

@Injectable()
export class LogInByAccountAction extends ActionAdvance {
  async call(
    params: LogInByAccountActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LogInResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      LogInByAccountAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/accounts/login`,
      {
        logInByAccount: params,
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

export interface LogInByAccountActionParam {
  accountName: string;
  password: string;
  accountType?: string;
  captchaUuid?: string;
  verifyCode?: string;
  clientInfo?: any;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface LogInResult {
  inventory?: SessionInventory;
}
