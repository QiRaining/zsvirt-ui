import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephPrimaryStorageInventory } from "./types";

@Injectable()
export class UpdateCephPrimaryStorageMonAction extends ActionAdvance {
  async call(
    params: UpdateCephPrimaryStorageMonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateCephPrimaryStorageMonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateCephPrimaryStorageMonAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/ceph/mons/${params.monUuid}/actions`,
      {
        updateCephPrimaryStorageMon: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateCephPrimaryStorageMonResult>(
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

export interface UpdateCephPrimaryStorageMonActionParam {
  monUuid: string;
  hostname?: string;
  sshUsername?: string;
  sshPassword?: string;
  sshPort?: number;
  monPort?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateCephPrimaryStorageMonResult {
  inventory?: CephPrimaryStorageInventory;
}
