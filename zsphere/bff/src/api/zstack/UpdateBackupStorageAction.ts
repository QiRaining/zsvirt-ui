import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class UpdateBackupStorageAction extends ActionAdvance {
  async call(
    params: UpdateBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/${params.uuid}/actions`,
      {
        updateBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<UpdateBackupStorageResult>(
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

export interface UpdateBackupStorageActionParam {
  uuid: string;
  name?: string;
  description?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface UpdateBackupStorageResult {
  inventory?: BackupStorageInventory;
}
