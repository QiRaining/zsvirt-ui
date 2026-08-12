import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class AddHostToHostSchedulingRuleGroupAction extends ActionAdvance {
  async call(
    params: AddHostToHostSchedulingRuleGroupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddHostToHostSchedulingRuleGroupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddHostToHostSchedulingRuleGroupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/hostSchedulingRuleGroup/${params.hostGroupUuid}/host/${params.hostUuid}`,
      {},
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AddHostToHostSchedulingRuleGroupResult>(
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

export interface AddHostToHostSchedulingRuleGroupActionParam {
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

export interface AddHostToHostSchedulingRuleGroupResult {}
