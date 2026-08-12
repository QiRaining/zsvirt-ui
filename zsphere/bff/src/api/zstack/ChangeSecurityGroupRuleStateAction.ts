import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupInventory } from "./types";

@Injectable()
export class ChangeSecurityGroupRuleStateAction extends ActionAdvance {
  async call(
    params: ChangeSecurityGroupRuleStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSecurityGroupRuleStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSecurityGroupRuleStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/${params.securityGroupUuid}/rules/state/actions`,
      {
        changeSecurityGroupRuleState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSecurityGroupRuleStateResult>(
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

export interface ChangeSecurityGroupRuleStateActionParam {
  securityGroupUuid: string;
  ruleUuids: any[];
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeSecurityGroupRuleStateResult {
  inventory?: SecurityGroupInventory;
}
