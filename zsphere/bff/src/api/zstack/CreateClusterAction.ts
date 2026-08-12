import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ClusterInventory } from "./types";

@Injectable()
export class CreateClusterAction extends ActionAdvance {
  async call(
    params: CreateClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters`,
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
    return this.postAction<CreateClusterResult>(
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

export interface CreateClusterActionParam {
  zoneUuid: string;
  name: string;
  description?: string;
  hypervisorType: string;
  type?: string;
  architecture?: string;
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

export interface CreateClusterResult {
  inventory?: ClusterInventory;
}
