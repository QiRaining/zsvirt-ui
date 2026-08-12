import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVersionAction extends ActionAdvance {
  async call(
    params: GetVersionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVersionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVersionAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/management-nodes/actions`,
      {
        getVersion: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVersionResult>(
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

export interface GetVersionActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetVersionResult {
  version?: string;
}
