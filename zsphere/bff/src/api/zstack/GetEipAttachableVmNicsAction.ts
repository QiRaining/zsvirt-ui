import { Injectable } from "@nestjs/common";

import { QueryAdvance } from "./base/query-advance";
import { QueryParam } from "./base/query-base";
import { ActionInfo } from "./base/types";

@Injectable()
export class GetEipAttachableVmNicsAction extends QueryAdvance {
  async call(
    params: GetEipAttachableVmNicsActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<GetEipAttachableVmNicsResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      GetEipAttachableVmNicsAction.name,
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
      "eipUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.get(
      `/eips/${params.eipUuid}/vm-instances/candidate-nics${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<GetEipAttachableVmNicsResult>(
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

export interface GetEipAttachableVmNicsActionParam {
  eipUuid?: string;
  vipUuid?: string;
  vmUuid?: string;
  vmName?: string;
  networkServiceProvider?: string;
  attachedToVm?: boolean;
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

export interface GetEipAttachableVmNicsResult {
  inventories?: any[];
  start?: number;
  more?: boolean;
}
