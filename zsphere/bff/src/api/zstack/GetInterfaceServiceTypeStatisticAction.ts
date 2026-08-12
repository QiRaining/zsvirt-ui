import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetInterfaceServiceTypeStatisticAction extends QueryAdvance {
  async call(
    params: GetInterfaceServiceTypeStatisticActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetInterfaceServiceTypeStatisticResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetInterfaceServiceTypeStatisticAction.name,
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
      `/hosts/hosts-network-interfaces/service-type-statistic${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetInterfaceServiceTypeStatisticResult>(
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

export interface GetInterfaceServiceTypeStatisticActionParam {
  interfaceUuid?: string;
  vlanId?: number;
  interfaceType?: string;
  serviceType?: any[];
  zoneUuid?: string;
  clusterUuid?: string;
  hostUuid?: string;
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

export interface GetInterfaceServiceTypeStatisticResult {
  serviceTypeStatistics?: any[];
  total?: number;
}
