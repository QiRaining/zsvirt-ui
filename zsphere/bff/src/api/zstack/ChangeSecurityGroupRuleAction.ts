import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { SecurityGroupRuleInventory } from "./types";

@Injectable()
export class ChangeSecurityGroupRuleAction extends ActionAdvance {
  async call(
    params: ChangeSecurityGroupRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeSecurityGroupRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeSecurityGroupRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/security-groups/rules/${params.uuid}/actions`,
      {
        changeSecurityGroupRule: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeSecurityGroupRuleResult>(
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

export interface ChangeSecurityGroupRuleActionParam {
  uuid: string;
  description?: string;
  remoteSecurityGroupUuid?: string;
  action?: string;
  state?: string;
  priority?: number;
  protocol?: string;
  srcIpRange?: string;
  dstIpRange?: string;
  dstPortRange?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeSecurityGroupRuleResult {
  inventory?: SecurityGroupRuleInventory;
}
