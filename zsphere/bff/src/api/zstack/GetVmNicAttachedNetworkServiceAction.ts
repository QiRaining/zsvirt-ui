import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetVmNicAttachedNetworkServiceAction extends QueryAdvance {
  async call(
    params: GetVmNicAttachedNetworkServiceActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetVmNicAttachedNetworkServiceResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetVmNicAttachedNetworkServiceAction.name,
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
      `/vm-instances/nics/${params.vmNicUuid}/attached-networkservices${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetVmNicAttachedNetworkServiceResult>(
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

export interface GetVmNicAttachedNetworkServiceActionParam {
  vmNicUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetVmNicAttachedNetworkServiceResult {
  networkServices?: any[];
}
