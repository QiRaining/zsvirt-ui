import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L3NetworkInventory } from "./types";

@Injectable()
export class DetachNetworkServiceFromL3NetworkAction extends ActionAdvance {
  async call(
    params: DetachNetworkServiceFromL3NetworkActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachNetworkServiceFromL3NetworkResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachNetworkServiceFromL3NetworkAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "l3NetworkUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/l3-networks/${params.l3NetworkUuid}/network-services${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachNetworkServiceFromL3NetworkResult>(
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

export interface DetachNetworkServiceFromL3NetworkActionParam {
  l3NetworkUuid: string;
  networkServices?: any;
  service?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachNetworkServiceFromL3NetworkResult {
  inventory?: L3NetworkInventory;
}
