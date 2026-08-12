import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetRolePolicyActionsAction extends QueryAdvance {
  async call(
    params: GetRolePolicyActionsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetRolePolicyActionsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetRolePolicyActionsAction.name,
      params,
    );
    const paramString = this.genParamStringForGet(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/identities/role/policy-actions${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetRolePolicyActionsResult>(
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

export interface GetRolePolicyActionsActionParam {
  showAllPolicies?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetRolePolicyActionsResult {
  policies?: any[];
  roles?: any[];
}
