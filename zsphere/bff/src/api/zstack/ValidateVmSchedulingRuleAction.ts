import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ValidateVmSchedulingRuleAction extends ActionAdvance {
  async call(
    params: ValidateVmSchedulingRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ValidateVmSchedulingRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ValidateVmSchedulingRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/validate/vmSchedulingRule`,
      {
        validateVmSchedulingRule: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ValidateVmSchedulingRuleResult>(
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

export interface ValidateVmSchedulingRuleActionParam {
  vmGroupUuid: string;
  hostGroupUuid?: string;
  rule: string;
  mode: string;
  zoneUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ValidateVmSchedulingRuleResult {}
