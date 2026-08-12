import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { L2NetworkInventory } from "./types";

@Injectable()
export class AttachL2NetworkToClusterAction extends ActionAdvance {
  async call(
    params: AttachL2NetworkToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachL2NetworkToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachL2NetworkToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/l2-networks/${params.l2NetworkUuid}/clusters/${params.clusterUuid}`,
      {
        null: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<AttachL2NetworkToClusterResult>(
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

export interface AttachL2NetworkToClusterActionParam {
  l2NetworkUuid: string;
  clusterUuid: string;
  l2ProviderType?: string;
  hostParams?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachL2NetworkToClusterResult {
  inventory?: L2NetworkInventory;
}
