import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateNetworkInterfacesAction extends QueryAdvance {
  async call(
    params: GetCandidateNetworkInterfacesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateNetworkInterfacesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateNetworkInterfacesAction.name,
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
      `/cluster/hosts-network-interfaces${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateNetworkInterfacesResult>(
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

export interface GetCandidateNetworkInterfacesActionParam {
  hostUuids: any[];
  interfaceType?: string;
  intersecting?: boolean;
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

export interface GetCandidateNetworkInterfacesResult {
  slaveNames?: any[];
  candidateNics?: any[];
}
