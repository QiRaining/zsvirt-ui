import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ClusterInventory } from "./types";

@Injectable()
export class UpdateClusterAction extends ActionAdvance {
  async call(
    params: UpdateClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/clusters/${params.uuid}/actions`,
      {
        updateCluster: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateClusterResult>(
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

export interface UpdateClusterActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateClusterResult {
  inventory?: ClusterInventory;
}
