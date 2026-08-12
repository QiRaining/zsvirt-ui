import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AccessControlRuleInventory } from "./types";

@Injectable()
export class AddAccessControlRuleAction extends ActionAdvance {
  async call(
    params: AddAccessControlRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddAccessControlRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddAccessControlRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/login-control/access-control/rules`,
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
    return this.postAction<AddAccessControlRuleResult>(
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

export interface AddAccessControlRuleActionParam {
  name: string;
  description?: string;
  rule: string;
  controlStrategy: string;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddAccessControlRuleResult {
  inventory?: AccessControlRuleInventory;
}
