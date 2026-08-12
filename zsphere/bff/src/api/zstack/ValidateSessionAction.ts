import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateSessionAction extends QueryAdvance {
  async call(
    params: ValidateSessionActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateSessionResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateSessionAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "sessionUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/accounts/sessions/${params.sessionUuid}/valid${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateSessionResult>(
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

export interface ValidateSessionActionParam {
  sessionUuid: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface ValidateSessionResult {
  valid?: boolean;
}
