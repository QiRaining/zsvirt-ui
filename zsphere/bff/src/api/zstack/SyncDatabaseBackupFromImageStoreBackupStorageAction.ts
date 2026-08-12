import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { DatabaseBackupInventory } from "./types";

@Injectable()
export class SyncDatabaseBackupFromImageStoreBackupStorageAction extends ActionAdvance {
  async call(
    params: SyncDatabaseBackupFromImageStoreBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncDatabaseBackupFromImageStoreBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncDatabaseBackupFromImageStoreBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/database-backups/${params.uuid}/actions`,
      {
        syncDatabaseBackupFromImageStoreBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncDatabaseBackupFromImageStoreBackupStorageResult>(
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

export interface SyncDatabaseBackupFromImageStoreBackupStorageActionParam {
  uuid: string;
  srcBackupStorageUuid: string;
  dstBackupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncDatabaseBackupFromImageStoreBackupStorageResult {
  inventory?: DatabaseBackupInventory;
}
