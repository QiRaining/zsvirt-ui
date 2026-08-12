import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QuerySNSEmailAddressAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QuerySNSEmailAddressResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QuerySNSEmailAddressAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery(
        "/sns/application-endpoints/emails/email-addresses",
        params,
      ),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QuerySNSEmailAddressResult>(
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

export interface QuerySNSEmailAddressActionParam {
  timeout?: number;
}

export interface QuerySNSEmailAddressResult {
  inventories?: any[];
  total?: number;
}
