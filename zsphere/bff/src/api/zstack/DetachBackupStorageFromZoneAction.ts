import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class DetachBackupStorageFromZoneAction extends ActionAdvance {
  async call(
    params: DetachBackupStorageFromZoneActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DetachBackupStorageFromZoneResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DetachBackupStorageFromZoneAction.name,
      params,
    );
    const paramString = this.genParamStringForDelete(params, [
      "systemTags",
      "userTags",
      "sessionId",
      "accessKeyId",
      "accessKeySecret",
      "requestIp",
      "timeout",
      "zoneUuid",
      "backupStorageUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/zones/${params.zoneUuid}/backup-storage/${params.backupStorageUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DetachBackupStorageFromZoneResult>(
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

export interface DetachBackupStorageFromZoneActionParam {
  backupStorageUuid: string;
  zoneUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DetachBackupStorageFromZoneResult {
  inventory?: BackupStorageInventory;
}
