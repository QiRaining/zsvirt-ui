import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetL3NetworkIpStatisticAction extends QueryAdvance {
  async call(
    params: GetL3NetworkIpStatisticActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetL3NetworkIpStatisticResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetL3NetworkIpStatisticAction.name,
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
      "l3NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/l3-networks/${params.l3NetworkUuid}/ip-statistic${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetL3NetworkIpStatisticResult>(
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

export interface GetL3NetworkIpStatisticActionParam {
  l3NetworkUuid: string;
  resourceType?: string;
  ip?: string;
  sortBy?: string;
  sortDirection?: string;
  start?: number;
  limit?: number;
  replyWithCount?: boolean;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetL3NetworkIpStatisticResult {
  ipStatistics?: any[];
  total?: number;
}
