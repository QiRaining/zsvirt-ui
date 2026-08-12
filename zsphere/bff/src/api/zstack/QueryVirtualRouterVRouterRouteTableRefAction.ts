import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryVirtualRouterVRouterRouteTableRefAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryVirtualRouterVRouterRouteTableRefResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryVirtualRouterVRouterRouteTableRefAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/vrouter-route-tables/virtual-router-refs", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryVirtualRouterVRouterRouteTableRefResult>(
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

export interface QueryVirtualRouterVRouterRouteTableRefActionParam {
  timeout?: number;
}

export interface QueryVirtualRouterVRouterRouteTableRefResult {
  inventories?: any[];
  total?: number;
}
