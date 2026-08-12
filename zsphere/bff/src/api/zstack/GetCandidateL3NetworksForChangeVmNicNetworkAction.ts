import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateL3NetworksForChangeVmNicNetworkAction extends QueryAdvance {
  async call(
    params: GetCandidateL3NetworksForChangeVmNicNetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateL3NetworksForChangeVmNicNetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateL3NetworksForChangeVmNicNetworkAction.name,
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
      "vmNicUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/nics/${params.vmNicUuid}/l3-networks-candidates${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateL3NetworksForChangeVmNicNetworkResult>(
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

export interface GetCandidateL3NetworksForChangeVmNicNetworkActionParam {
  vmNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetCandidateL3NetworksForChangeVmNicNetworkResult {
  inventories?: any[];
}
