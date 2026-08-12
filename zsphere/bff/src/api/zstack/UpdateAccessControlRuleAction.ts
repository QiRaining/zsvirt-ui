import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccessControlRuleInventory } from "./types";

@Injectable()
export class UpdateAccessControlRuleAction extends ActionAdvance {
  async call(
    params: UpdateAccessControlRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateAccessControlRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAccessControlRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/login-control/access-control/rules/${params.uuid}/actions`,
      {
        updateAccessControlRule: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateAccessControlRuleResult>(
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

export interface UpdateAccessControlRuleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  rule?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateAccessControlRuleResult {
  inventory?: AccessControlRuleInventory;
}
