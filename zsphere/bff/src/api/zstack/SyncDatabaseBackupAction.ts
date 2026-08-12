import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncDatabaseBackupAction extends ActionAdvance {
  async call(
    params: SyncDatabaseBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncDatabaseBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncDatabaseBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/database-backups/imageStore/${params.imageStoreUuid}/actions`,
      {
        syncDatabaseBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncDatabaseBackupResult>(
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

export interface SyncDatabaseBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncDatabaseBackupResult {
  result?: any;
}
