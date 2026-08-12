import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetHostNetworkFactsAction extends QueryAdvance {
  async call(
    params: GetHostNetworkFactsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetHostNetworkFactsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetHostNetworkFactsAction.name,
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
      "hostUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/hosts/network-facts/${params.hostUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetHostNetworkFactsResult>(
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

export interface GetHostNetworkFactsActionParam {
  hostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetHostNetworkFactsResult {
  bondings?: any[];
  nics?: any[];
}
