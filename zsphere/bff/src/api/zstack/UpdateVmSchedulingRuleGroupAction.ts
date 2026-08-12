import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmSchedulingRuleGroupInventory } from "./types";

@Injectable()
export class UpdateVmSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: UpdateVmSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateVmSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateVmSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vmSchedulingRuleGroup/${params.uuid}/update`,
      {
        updateVmSchedulingRuleGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateVmSchedulingRuleGroupResult>(
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

export interface UpdateVmSchedulingRuleGroupActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateVmSchedulingRuleGroupResult {
  inventory?: VmSchedulingRuleGroupInventory;
}
