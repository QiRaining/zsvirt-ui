import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncVmBackupFromImageStoreBackupStorageAction extends ActionAdvance {
  async call(
    params: SyncVmBackupFromImageStoreBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncVmBackupFromImageStoreBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncVmBackupFromImageStoreBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-backups/${params.groupUuid}/actions`,
      {
        syncVmBackupFromImageStoreBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncVmBackupFromImageStoreBackupStorageResult>(
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

export interface SyncVmBackupFromImageStoreBackupStorageActionParam {
  groupUuid: string;
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

export interface SyncVmBackupFromImageStoreBackupStorageResult {
  inventories?: any[];
}
