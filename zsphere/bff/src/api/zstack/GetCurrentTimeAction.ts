import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCurrentTimeAction extends ActionAdvance {
  async call(
    params: GetCurrentTimeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCurrentTimeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCurrentTimeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/management-nodes/actions`,
      {
        getCurrentTime: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCurrentTimeResult>(
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

export interface GetCurrentTimeActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetCurrentTimeResult {
  currentTime?: any;
}
