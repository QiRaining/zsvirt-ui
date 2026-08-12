import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVmSchedulingRulesExecuteStateAction extends ActionAdvance {
  async call(
    params: GetVmSchedulingRulesExecuteStateActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVmSchedulingRulesExecuteStateResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVmSchedulingRulesExecuteStateAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/get/vmSchedulingRules/conflict/state`,
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
    return this.postAction<GetVmSchedulingRulesExecuteStateResult>(
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

export interface GetVmSchedulingRulesExecuteStateActionParam {
  uuids: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVmSchedulingRulesExecuteStateResult {
  ruleMapState?: any;
}
