import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetManagementNodeArchAction extends ActionAdvance {
  async call(
    params: GetManagementNodeArchActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetManagementNodeArchResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetManagementNodeArchAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/management-nodes/actions`,
      {
        getManagementNodeArch: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetManagementNodeArchResult>(
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

export interface GetManagementNodeArchActionParam {
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface GetManagementNodeArchResult {
  architecture?: string;
}
