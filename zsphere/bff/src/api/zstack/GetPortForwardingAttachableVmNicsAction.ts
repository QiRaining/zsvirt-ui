import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetPortForwardingAttachableVmNicsAction extends QueryAdvance {
  async call(
    params: GetPortForwardingAttachableVmNicsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetPortForwardingAttachableVmNicsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetPortForwardingAttachableVmNicsAction.name,
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
      "ruleUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/port-forwarding/${params.ruleUuid}/vm-instances/candidate-nics${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetPortForwardingAttachableVmNicsResult>(
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

export interface GetPortForwardingAttachableVmNicsActionParam {
  ruleUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface GetPortForwardingAttachableVmNicsResult {
  inventories?: any[];
}
