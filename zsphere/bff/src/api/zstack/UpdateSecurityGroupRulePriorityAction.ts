import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class UpdateSecurityGroupRulePriorityAction extends ActionAdvance {
  async call(
    params: UpdateSecurityGroupRulePriorityActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateSecurityGroupRulePriorityResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateSecurityGroupRulePriorityAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/${params.securityGroupUuid}/rules/priority/actions`,
      {
        updateSecurityGroupRulePriority: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateSecurityGroupRulePriorityResult>(
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

export interface UpdateSecurityGroupRulePriorityActionParam {
  securityGroupUuid: string;
  type: string;
  rules: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateSecurityGroupRulePriorityResult {
  inventory?: SecurityGroupInventory;
}
