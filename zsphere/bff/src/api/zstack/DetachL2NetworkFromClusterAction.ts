import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class DetachL2NetworkFromClusterAction extends ActionAdvance {
  async call(
    params: DetachL2NetworkFromClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachL2NetworkFromClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachL2NetworkFromClusterAction.name,
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
      "clusterUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/l2-networks/${params.l2NetworkUuid}/clusters/${params.clusterUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachL2NetworkFromClusterResult>(
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

export interface DetachL2NetworkFromClusterActionParam {
  l2NetworkUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachL2NetworkFromClusterResult {
  inventory?: L2NetworkInventory;
}
