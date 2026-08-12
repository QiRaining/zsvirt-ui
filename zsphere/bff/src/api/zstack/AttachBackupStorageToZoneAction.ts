import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class AttachBackupStorageToZoneAction extends ActionAdvance {
  async call(
    params: AttachBackupStorageToZoneActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AttachBackupStorageToZoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AttachBackupStorageToZoneAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/zones/${params.zoneUuid}/backup-storage/${params.backupStorageUuid}`,
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
    return this.postAction<AttachBackupStorageToZoneResult>(
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

export interface AttachBackupStorageToZoneActionParam {
  zoneUuid: string;
  backupStorageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AttachBackupStorageToZoneResult {
  inventory?: BackupStorageInventory;
}
