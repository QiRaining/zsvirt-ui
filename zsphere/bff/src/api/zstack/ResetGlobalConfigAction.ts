import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ResetGlobalConfigAction extends ActionAdvance {
  async call(
    params: ResetGlobalConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ResetGlobalConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ResetGlobalConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/global-configurations/actions`,
      {
        resetGlobalConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ResetGlobalConfigResult>(
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

export interface ResetGlobalConfigActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ResetGlobalConfigResult {}
