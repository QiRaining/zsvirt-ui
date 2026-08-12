import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncVmBackupAction extends ActionAdvance {
  async call(
    params: SyncVmBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncVmBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncVmBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-backups/imageStore/${params.imageStoreUuid}/actions`,
      {
        syncVmBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncVmBackupResult>(
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

export interface SyncVmBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncVmBackupResult {
  result?: any;
}
