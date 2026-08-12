import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachVmFromVmSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: DetachVmFromVmSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachVmFromVmSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachVmFromVmSchedulingRuleGroupAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "vmGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/vmSchedulingRuleGroup/${params.vmGroupUuid}/vmInstance/${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachVmFromVmSchedulingRuleGroupResult>(
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

export interface DetachVmFromVmSchedulingRuleGroupActionParam {
  vmGroupUuid: string;
  vmUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachVmFromVmSchedulingRuleGroupResult {}
