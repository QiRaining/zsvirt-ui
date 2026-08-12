import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ApplyDRSAdviceAction extends ActionAdvance {
  async call(
    params: ApplyDRSAdviceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ApplyDRSAdviceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ApplyDRSAdviceAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/clusters/drs/advice/${params.adviceUuid}/actions`,
      {
        applyDRSAdvice: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ApplyDRSAdviceResult>(
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

export interface ApplyDRSAdviceActionParam {
  adviceUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ApplyDRSAdviceResult {
  vmMigrationActivityUuid?: string;
}
