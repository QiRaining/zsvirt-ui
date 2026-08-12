import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ClusterDRSInventory } from "./types";

@Injectable()
export class CreateClusterDRSAction extends ActionAdvance {
  async call(
    params: CreateClusterDRSActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateClusterDRSResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateClusterDRSAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters/${params.clusterUuid}/drs`,
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
    return this.postAction<CreateClusterDRSResult>(
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

export interface CreateClusterDRSActionParam {
  name: string;
  description?: string;
  clusterUuid: string;
  automationLevel: string;
  thresholds: any[];
  thresholdDuration: number;
  defaultEnable?: boolean;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateClusterDRSResult {
  inventory?: ClusterDRSInventory;
}
