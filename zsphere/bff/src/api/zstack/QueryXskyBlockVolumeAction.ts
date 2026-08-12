import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class QueryXskyBlockVolumeAction extends QueryAdvance {
  async call(
    params: QueryParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<QueryXskyBlockVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      QueryXskyBlockVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.get(
      this.buildQuery("/xksy/block-volumes", params),
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<QueryXskyBlockVolumeResult>(
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

export interface QueryXskyBlockVolumeActionParam {
  timeout?: number;
}

export interface QueryXskyBlockVolumeResult {
  inventories?: any[];
  total?: number;
}
