import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryZStoneAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryZStoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryZStoneAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/zstone-plugin", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryZStoneResult>(
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

export interface QueryZStoneActionParam {
  timeout?: number;
}

export interface QueryZStoneResult {
  inventories?: any[];
  total?: number;
}
