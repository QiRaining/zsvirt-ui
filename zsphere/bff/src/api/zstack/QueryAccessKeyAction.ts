import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryAccessKeyAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryAccessKeyResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryAccessKeyAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/accesskeys", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryAccessKeyResult>(
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

export interface QueryAccessKeyActionParam {
  timeout?: number;
}

export interface QueryAccessKeyResult {
  inventories?: any[];
  total?: number;
}
