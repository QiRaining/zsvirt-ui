import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DetachHostFromHostSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: DetachHostFromHostSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachHostFromHostSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachHostFromHostSchedulingRuleGroupAction.name,
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
      "hostGroupUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/hostSchedulingRuleGroup/${params.hostGroupUuid}/host${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachHostFromHostSchedulingRuleGroupResult>(
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

export interface DetachHostFromHostSchedulingRuleGroupActionParam {
  hostGroupUuid: string;
  hostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachHostFromHostSchedulingRuleGroupResult {}
