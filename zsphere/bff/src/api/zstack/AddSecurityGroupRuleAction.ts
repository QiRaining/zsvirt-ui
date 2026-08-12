import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class AddSecurityGroupRuleAction extends ActionAdvance {
  async call(
    params: AddSecurityGroupRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSecurityGroupRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSecurityGroupRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/security-groups/${params.securityGroupUuid}/rules`,
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
    return this.postAction<AddSecurityGroupRuleResult>(
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

export interface AddSecurityGroupRuleActionParam {
  securityGroupUuid: string;
  rules: any[];
  remoteSecurityGroupUuids?: any[];
  priority?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddSecurityGroupRuleResult {
  inventory?: SecurityGroupInventory;
}
