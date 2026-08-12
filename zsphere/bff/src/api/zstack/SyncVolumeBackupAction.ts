import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class SyncVolumeBackupAction extends ActionAdvance {
  async call(
    params: SyncVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<SyncVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      SyncVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-backups/imageStore/${params.imageStoreUuid}/actions`,
      {
        syncVolumeBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<SyncVolumeBackupResult>(
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

export interface SyncVolumeBackupActionParam {
  imageStoreUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface SyncVolumeBackupResult {
  result?: any;
}
