import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class AddCephBackupStorageAction extends ActionAdvance {
  async call(
    params: AddCephBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddCephBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/backup-storage/ceph`,
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
    return this.postAction<AddBackupStorageResult>(
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

export interface AddCephBackupStorageActionParam {
  monUrls: any[];
  poolName?: string;
  url?: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
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

export interface AddBackupStorageResult {
  inventory?: BackupStorageInventory;
}
