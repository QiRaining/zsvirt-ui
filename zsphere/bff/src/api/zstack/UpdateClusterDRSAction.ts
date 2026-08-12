import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ClusterDRSInventory } from "./types";

@Injectable()
export class UpdateClusterDRSAction extends ActionAdvance {
  async call(
    params: UpdateClusterDRSActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateClusterDRSResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateClusterDRSAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/clusters/drs/${params.uuid}/actions`,
      {
        updateClusterDRS: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateClusterDRSResult>(
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

export interface UpdateClusterDRSActionParam {
  uuid: string;
  name?: string;
  description?: string;
  automationLevel?: string;
  thresholds?: any[];
  thresholdDuration?: number;
  state?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateClusterDRSResult {
  inventory?: ClusterDRSInventory;
}
