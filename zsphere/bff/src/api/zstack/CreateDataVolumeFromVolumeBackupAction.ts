import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { VolumeInventory } from "./types";

@Injectable()
export class CreateDataVolumeFromVolumeBackupAction extends ActionAdvance {
  async call(
    params: CreateDataVolumeFromVolumeBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CreateDataVolumeFromVolumeBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CreateDataVolumeFromVolumeBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/volumes/data-volume/from/volume-template/${params.backupUuid}`,
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
    return this.postAction<CreateDataVolumeFromVolumeBackupResult>(
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

export interface CreateDataVolumeFromVolumeBackupActionParam {
  name: string;
  vmInstanceUuid?: string;
  backupUuid: string;
  backupStorageUuid?: string;
  primaryStorageUuid?: string;
  description?: string;
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

export interface CreateDataVolumeFromVolumeBackupResult {
  inventory?: VolumeInventory;
}
