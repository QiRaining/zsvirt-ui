import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VmSchedulingRuleInventory } from "./types";

@Injectable()
export class ChangeVmSchedulingRuleStateAction extends ActionAdvance {
  async call(
    params: ChangeVmSchedulingRuleStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ChangeVmSchedulingRuleStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ChangeVmSchedulingRuleStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vmSchedulingRule/${params.uuid}/actions`,
      {
        changeVmSchedulingRuleState: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ChangeVmSchedulingRuleStateResult>(
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

export interface ChangeVmSchedulingRuleStateActionParam {
  uuid: string;
  state: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ChangeVmSchedulingRuleStateResult {
  inventory?: VmSchedulingRuleInventory;
}
