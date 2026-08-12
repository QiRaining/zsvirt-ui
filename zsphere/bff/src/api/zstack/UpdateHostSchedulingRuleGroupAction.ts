import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostSchedulingRuleGroupInventory } from "./types";

@Injectable()
export class UpdateHostSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: UpdateHostSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateHostSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateHostSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/hostSchedulingRuleGroup/${params.uuid}`,
      {
        updateHostSchedulingRuleGroup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateHostSchedulingRuleGroupResult>(
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

export interface UpdateHostSchedulingRuleGroupActionParam {
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

export interface UpdateHostSchedulingRuleGroupResult {
  inventory?: HostSchedulingRuleGroupInventory;
}
