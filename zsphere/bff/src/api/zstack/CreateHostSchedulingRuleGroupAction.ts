import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { HostSchedulingRuleGroupInventory } from "./types";

@Injectable()
export class CreateHostSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: CreateHostSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateHostSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateHostSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hostSchedulingRuleGroup`,
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
    return this.postAction<CreateHostSchedulingRuleGroupResult>(
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

export interface CreateHostSchedulingRuleGroupActionParam {
  name: string;
  description?: string;
  zoneUuid: string;
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

export interface CreateHostSchedulingRuleGroupResult {
  inventory?: HostSchedulingRuleGroupInventory;
}
