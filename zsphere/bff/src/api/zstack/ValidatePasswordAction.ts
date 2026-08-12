import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidatePasswordAction extends ActionAdvance {
  async call(
    params: ValidatePasswordActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidatePasswordResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidatePasswordAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/password/verify`,
      {
        validatePassword: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidatePasswordResult>(
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

export interface ValidatePasswordActionParam {
  loginName: string;
  password: string;
  loginType: string;
  systemTags?: any[];
  userTags?: any[];
  requestIp?: string;
  timeout?: number;
}

export interface ValidatePasswordResult {
  available?: boolean;
}
