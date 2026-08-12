import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevertVolumeFromVolumeBackupAction extends ActionAdvance {
  async call(
    params: RevertVolumeFromVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevertVolumeFromVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevertVolumeFromVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/volume-backups/${params.uuid}/actions`,
      {
        revertVolumeFromVolumeBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevertVolumeFromVolumeBackupResult>(
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

export interface RevertVolumeFromVolumeBackupActionParam {
  uuid: string;
  backupStorageUuid?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevertVolumeFromVolumeBackupResult {}
