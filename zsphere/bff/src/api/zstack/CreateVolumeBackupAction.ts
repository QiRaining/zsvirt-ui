import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeBackupInventory } from "./types";

@Injectable()
export class CreateVolumeBackupAction extends ActionAdvance {
  async call(
    params: CreateVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/${params.volumeUuid}/volume-backups`,
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
    return this.postAction<CreateVolumeBackupResult>(
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

export interface CreateVolumeBackupActionParam {
  volumeUuid: string;
  backupStorageUuid: string;
  name: string;
  description?: string;
  mode?: string;
  volumeReadBandwidth?: number;
  volumeWriteBandwidth?: number;
  networkReadBandwidth?: number;
  networkWriteBandwidth?: number;
  resourceUuid?: string;
  tagUuids?: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CreateVolumeBackupResult {
  inventory?: VolumeBackupInventory;
}
