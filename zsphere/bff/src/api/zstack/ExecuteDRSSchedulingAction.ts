import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExecuteDRSSchedulingAction extends ActionAdvance {
  async call(
    params: ExecuteDRSSchedulingActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExecuteDRSSchedulingResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExecuteDRSSchedulingAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/clusters/drs/${params.uuid}/actions`,
      {
        executeDRSScheduling: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExecuteDRSSchedulingResult>(
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

export interface ExecuteDRSSchedulingActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExecuteDRSSchedulingResult {}
