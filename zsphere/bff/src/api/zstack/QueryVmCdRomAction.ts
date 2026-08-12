import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryVmCdRomAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryVmCdRomResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryVmCdRomAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/vm-instances/cdroms", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryVmCdRomResult>(
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

export interface QueryVmCdRomActionParam {
  timeout?: number;
}

export interface QueryVmCdRomResult {
  inventories?: any[];
  total?: number;
}
