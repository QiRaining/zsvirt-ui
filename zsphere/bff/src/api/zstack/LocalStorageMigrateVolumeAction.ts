import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { LocalStorageResourceRefInventory } from "./types";

@Injectable()
export class LocalStorageMigrateVolumeAction extends ActionAdvance {
  async call(
    params: LocalStorageMigrateVolumeActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<LocalStorageMigrateVolumeResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      LocalStorageMigrateVolumeAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/primary-storage/local-storage/volumes/${params.volumeUuid}/actions`,
      {
        localStorageMigrateVolume: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<LocalStorageMigrateVolumeResult>(
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

export interface LocalStorageMigrateVolumeActionParam {
  volumeUuid: string;
  destHostUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface LocalStorageMigrateVolumeResult {
  inventory?: LocalStorageResourceRefInventory;
}
