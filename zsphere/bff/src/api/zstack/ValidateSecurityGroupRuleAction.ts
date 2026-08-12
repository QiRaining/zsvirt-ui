import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateSecurityGroupRuleAction extends QueryAdvance {
  async call(
    params: ValidateSecurityGroupRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateSecurityGroupRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateSecurityGroupRuleAction.name,
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
      "securityGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/security-groups/${params.securityGroupUuid}/rules/validation${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateSecurityGroupRuleResult>(
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

export interface ValidateSecurityGroupRuleActionParam {
  securityGroupUuid: string;
  type: string;
  protocol: string;
  remoteSecurityGroupUuid?: string;
  ipVersion?: number;
  srcIpRange?: string;
  dstIpRange?: string;
  dstPortRange?: string;
  action?: string;
  startPort?: number;
  endPort?: number;
  allowedCidr?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateSecurityGroupRuleResult {
  available?: boolean;
  code?: string;
  reason?: string;
}
