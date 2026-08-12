import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVmStartingCandidateClustersHostsAction extends QueryAdvance {
  async call(
    params: GetVmStartingCandidateClustersHostsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVmStartingCandidateClustersHostsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVmStartingCandidateClustersHostsAction.name,
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
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/vm-instances/${params.uuid}/starting-target-hosts${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVmStartingCandidateClustersHostsResult>(
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

export interface GetVmStartingCandidateClustersHostsActionParam {
  uuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVmStartingCandidateClustersHostsResult {
  hosts?: any[];
  clusters?: any[];
}
