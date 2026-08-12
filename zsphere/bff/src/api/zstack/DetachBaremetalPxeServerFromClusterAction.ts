import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class DetachBaremetalPxeServerFromClusterAction extends ActionAdvance {
  async call(
    params: DetachBaremetalPxeServerFromClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachBaremetalPxeServerFromClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachBaremetalPxeServerFromClusterAction.name,
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
      "clusterUuid",
      "pxeServerUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/clusters/${params.clusterUuid}/pxeservers/${params.pxeServerUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachBaremetalPxeServerFromClusterResult>(
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

export interface DetachBaremetalPxeServerFromClusterActionParam {
  pxeServerUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachBaremetalPxeServerFromClusterResult {
  inventory?: BaremetalPxeServerInventory;
}
