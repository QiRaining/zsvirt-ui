import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class DetachL2NetworkFromHostAction extends ActionAdvance {
  async call(
    params: DetachL2NetworkFromHostActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachL2NetworkFromHostResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachL2NetworkFromHostAction.name,
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
      "l2NetworkUuid",
      "hostUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/l2-networks/${params.l2NetworkUuid}/hosts/${params.hostUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachL2NetworkFromHostResult>(
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

export interface DetachL2NetworkFromHostActionParam {
  l2NetworkUuid: string;
  hostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachL2NetworkFromHostResult {
  inventory?: L2NetworkInventory;
}
