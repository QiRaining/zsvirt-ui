import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RecoverVmBackupFromImageStoreBackupStorageAction extends ActionAdvance {
  async call(
    params: RecoverVmBackupFromImageStoreBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RecoverVmBackupFromImageStoreBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RecoverVmBackupFromImageStoreBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-backups/${params.groupUuid}/actions`,
      {
        recoverVmBackupFromImageStoreBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RecoverVmBackupFromImageStoreBackupStorageResult>(
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

export interface RecoverVmBackupFromImageStoreBackupStorageActionParam {
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

export interface RecoverVmBackupFromImageStoreBackupStorageResult {
  inventories?: any[];
}
