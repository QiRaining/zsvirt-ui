import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryZceXThirdPartyPlatformAlertRefAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryZceXThirdPartyPlatformAlertRefResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryZceXThirdPartyPlatformAlertRefAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/zce-x-plugin/alert-platform", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryZceXThirdPartyPlatformAlertRefResult>(
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

export interface QueryZceXThirdPartyPlatformAlertRefActionParam {
  timeout?: number;
}

export interface QueryZceXThirdPartyPlatformAlertRefResult {
  inventories?: any[];
  total?: number;
}
