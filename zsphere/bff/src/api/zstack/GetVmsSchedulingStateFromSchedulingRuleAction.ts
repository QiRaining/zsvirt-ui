import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVmsSchedulingStateFromSchedulingRuleAction extends ActionAdvance {
  async call(
    params: GetVmsSchedulingStateFromSchedulingRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVmsSchedulingStateFromSchedulingRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVmsSchedulingStateFromSchedulingRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/get/vms/schedulingState/from/SchedulingRule`,
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
    return this.postAction<GetVmsSchedulingStateFromSchedulingRuleResult>(
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

export interface GetVmsSchedulingStateFromSchedulingRuleActionParam {
  ruleUuid: string;
  vmUuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVmsSchedulingStateFromSchedulingRuleResult {
  ruleMapState?: any;
}
