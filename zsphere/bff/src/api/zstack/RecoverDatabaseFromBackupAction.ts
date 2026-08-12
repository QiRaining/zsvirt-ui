import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RecoverDatabaseFromBackupAction extends ActionAdvance {
  async call(
    params: RecoverDatabaseFromBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RecoverDatabaseFromBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RecoverDatabaseFromBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/database-backups/actions`,
      {
        recoverDatabaseFromBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RecoverDatabaseFromBackupResult>(
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

export interface RecoverDatabaseFromBackupActionParam {
  uuid?: string;
  backupStorageUrl?: string;
  backupInstallPath?: string;
  mysqlRootPassword: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RecoverDatabaseFromBackupResult {
  logListenPort?: number;
}
