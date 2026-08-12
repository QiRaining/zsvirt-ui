import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BaremetalPxeServerInventory } from "./types";

@Injectable()
export class AttachBaremetalPxeServerToClusterAction extends ActionAdvance {
  async call(
    params: AttachBaremetalPxeServerToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachBaremetalPxeServerToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachBaremetalPxeServerToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters/${params.clusterUuid}/pxeservers/${params.pxeServerUuid}`,
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
    return this.postAction<AttachBaremetalPxeServerToClusterResult>(
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

export interface AttachBaremetalPxeServerToClusterActionParam {
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

export interface AttachBaremetalPxeServerToClusterResult {
  inventory?: BaremetalPxeServerInventory;
}
