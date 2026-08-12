import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetCandidateHostKernelInterfacesAction extends QueryAdvance {
  async call(
    params: GetCandidateHostKernelInterfacesActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetCandidateHostKernelInterfacesResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetCandidateHostKernelInterfacesAction.name,
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
      "l2NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/hosts/kernel-interfaces${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetCandidateHostKernelInterfacesResult>(
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

export interface GetCandidateHostKernelInterfacesActionParam {
  hostUuids: any[];
  cidr?: string;
  trafficTypes?: any[];
  containsRejected?: boolean;
  limit?: number;
  start?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: any;
  accessKeyId?: any;
  accessKeySecret?: any;
  requestIp?: any;
  timeout?: number;
}

export interface GetCandidateHostKernelInterfacesResult {
  results?: any[];
}
