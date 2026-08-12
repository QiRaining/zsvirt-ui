import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephBackupStorageInventory } from "./types";

@Injectable()
export class UpdateCephBackupStorageMonAction extends ActionAdvance {
  async call(
    params: UpdateCephBackupStorageMonActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateCephBackupStorageMonResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateCephBackupStorageMonAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/ceph/mons/${params.monUuid}/actions`,
      {
        updateCephBackupStorageMon: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateCephBackupStorageMonResult>(
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

export interface UpdateCephBackupStorageMonActionParam {
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

export interface UpdateCephBackupStorageMonResult {
  inventory?: CephBackupStorageInventory;
}
