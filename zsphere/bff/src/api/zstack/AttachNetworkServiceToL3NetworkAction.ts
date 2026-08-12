import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class AttachNetworkServiceToL3NetworkAction extends ActionAdvance {
  async call(
    params: AttachNetworkServiceToL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachNetworkServiceToL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachNetworkServiceToL3NetworkAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l3-networks/${params.l3NetworkUuid}/network-services`,
      {
        params: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AttachNetworkServiceToL3NetworkResult>(
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

export interface AttachNetworkServiceToL3NetworkActionParam {
  l3NetworkUuid: string;
  networkServices: any;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachNetworkServiceToL3NetworkResult {
  inventory?: L3NetworkInventory;
}
