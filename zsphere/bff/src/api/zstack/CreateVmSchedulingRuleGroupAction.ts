import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmSchedulingRuleGroupInventory } from "./types";

@Injectable()
export class CreateVmSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: CreateVmSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVmSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVmSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/vmSchedulingRuleGroup`,
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
    return this.postAction<CreateVmSchedulingRuleGroupResult>(
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

export interface CreateVmSchedulingRuleGroupActionParam {
  zoneUuid: string;
  name: string;
  description?: string;
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

export interface CreateVmSchedulingRuleGroupResult {
  inventory?: VmSchedulingRuleGroupInventory;
}
