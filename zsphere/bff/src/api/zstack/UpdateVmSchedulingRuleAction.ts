import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmSchedulingRuleInventory } from "./types";

@Injectable()
export class UpdateVmSchedulingRuleAction extends ActionAdvance {
  async call(
    params: UpdateVmSchedulingRuleActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmSchedulingRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmSchedulingRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vmSchedulingRule/${params.uuid}/update`,
      {
        updateVmSchedulingRule: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmSchedulingRuleResult>(
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

export interface UpdateVmSchedulingRuleActionParam {
  uuid: string;
  name?: string;
  description?: string;
  mode?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmSchedulingRuleResult {
  inventory?: VmSchedulingRuleInventory;
}
