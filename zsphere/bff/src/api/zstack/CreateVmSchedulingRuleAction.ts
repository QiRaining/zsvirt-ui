import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { AffinityGroupInventory } from "./types";

@Injectable()
export class CreateVmSchedulingRuleAction extends ActionAdvance {
  async call(
    params: CreateVmSchedulingRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateAffinityGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmSchedulingRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vmsSchedulingRule`,
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
    return this.postAction<CreateAffinityGroupResult>(
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

export interface CreateVmSchedulingRuleActionParam {
  rule: string;
  mode: string;
  vmGroupUuid: string;
  hostGroupUuid?: string;
  name: string;
  description?: string;
  policy?: string;
  type?: string;
  zoneUuid?: string;
  subType?: string;
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

export interface CreateAffinityGroupResult {
  inventory?: AffinityGroupInventory;
}
