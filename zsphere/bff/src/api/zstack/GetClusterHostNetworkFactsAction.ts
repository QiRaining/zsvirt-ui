import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetClusterHostNetworkFactsAction extends QueryAdvance {
  async call(
    params: GetClusterHostNetworkFactsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetClusterHostNetworkFactsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetClusterHostNetworkFactsAction.name,
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
      "clusterUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/cluster/hosts-network-facts/${params.clusterUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetClusterHostNetworkFactsResult>(
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

export interface GetClusterHostNetworkFactsActionParam {
  clusterUuid: string;
  limit?: number;
  start?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetClusterHostNetworkFactsResult {
  bondings?: any[];
  nics?: any[];
}
