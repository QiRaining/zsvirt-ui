import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateInstanceOfferingUserConfigAction extends ActionAdvance {
  async call(
    params: ValidateInstanceOfferingUserConfigActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateInstanceOfferingUserConfigResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateInstanceOfferingUserConfigAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/billings/accounts/actions`,
      {
        validateInstanceOfferingUserConfig: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateInstanceOfferingUserConfigResult>(
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

export interface ValidateInstanceOfferingUserConfigActionParam {
  config: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateInstanceOfferingUserConfigResult {}
