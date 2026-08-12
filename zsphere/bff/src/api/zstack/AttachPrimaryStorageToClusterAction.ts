import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class AttachPrimaryStorageToClusterAction extends ActionAdvance {
  async call(
    params: AttachPrimaryStorageToClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachPrimaryStorageToClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachPrimaryStorageToClusterAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/clusters/${params.clusterUuid}/primary-storage/${params.primaryStorageUuid}`,
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
    return this.postAction<AttachPrimaryStorageToClusterResult>(
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

export interface AttachPrimaryStorageToClusterActionParam {
  clusterUuid: string;
  primaryStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachPrimaryStorageToClusterResult {
  inventory?: PrimaryStorageInventory;
}
