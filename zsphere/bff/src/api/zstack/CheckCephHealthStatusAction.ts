import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CheckCephHealthStatusAction extends ActionAdvance {
  async call(
    params: CheckCephHealthStatusActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CheckCephHealthStatusResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CheckCephHealthStatusAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zops/check-ceph-health`,
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
    return this.postAction<CheckCephHealthStatusResult>(
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

export interface CheckCephHealthStatusActionParam {
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CheckCephHealthStatusResult {}
