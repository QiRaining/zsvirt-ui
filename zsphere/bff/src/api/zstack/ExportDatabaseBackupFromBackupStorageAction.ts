import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExportDatabaseBackupFromBackupStorageAction extends ActionAdvance {
  async call(
    params: ExportDatabaseBackupFromBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExportDatabaseBackupFromBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExportDatabaseBackupFromBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/database-backups/${params.databaseBackupUuid}/backup-storage/${params.backupStorageUuid}/actions`,
      {
        exportDatabaseBackupFromBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExportDatabaseBackupFromBackupStorageResult>(
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

export interface ExportDatabaseBackupFromBackupStorageActionParam {
  backupStorageUuid: string;
  databaseBackupUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExportDatabaseBackupFromBackupStorageResult {
  databaseBackupUrl?: string;
}
