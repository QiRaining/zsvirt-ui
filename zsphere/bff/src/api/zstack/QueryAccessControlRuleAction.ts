import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryAccessControlRuleAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryAccessControlRuleResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryAccessControlRuleAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/login-control/access-control/rules", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryAccessControlRuleResult>(
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

export interface QueryAccessControlRuleActionParam {
  timeout?: number;
}

export interface QueryAccessControlRuleResult {
  inventories?: any[];
  total?: number;
}
