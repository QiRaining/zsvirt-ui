import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { PrimaryStorageInventory } from "./types";

@Injectable()
export class DetachPrimaryStorageFromClusterAction extends ActionAdvance {
  async call(
    params: DetachPrimaryStorageFromClusterActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachPrimaryStorageFromClusterResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachPrimaryStorageFromClusterAction.name,
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
      "primaryStorageUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/clusters/${params.clusterUuid}/primary-storage/${params.primaryStorageUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachPrimaryStorageFromClusterResult>(
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

export interface DetachPrimaryStorageFromClusterActionParam {
  primaryStorageUuid: string;
  clusterUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachPrimaryStorageFromClusterResult {
  inventory?: PrimaryStorageInventory;
}
