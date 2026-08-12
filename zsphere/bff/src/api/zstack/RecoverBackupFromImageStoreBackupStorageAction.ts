import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeBackupInventory } from "./types";

@Injectable()
export class RecoverBackupFromImageStoreBackupStorageAction extends ActionAdvance {
  async call(
    params: RecoverBackupFromImageStoreBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RecoverBackupFromImageStoreBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RecoverBackupFromImageStoreBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-backups/${params.uuid}/actions`,
      {
        recoverBackupFromImageStoreBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RecoverBackupFromImageStoreBackupStorageResult>(
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

export interface RecoverBackupFromImageStoreBackupStorageActionParam {
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

export interface RecoverBackupFromImageStoreBackupStorageResult {
  inventory?: VolumeBackupInventory;
}
