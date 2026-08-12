import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class CleanUpTrashOnBackupStorageAction extends ActionAdvance {
  async call(
    params: CleanUpTrashOnBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<CleanUpTrashOnBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      CleanUpTrashOnBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/${params.uuid}/trash/actions`,
      {
        cleanUpTrashOnBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<CleanUpTrashOnBackupStorageResult>(
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

export interface CleanUpTrashOnBackupStorageActionParam {
  uuid: string;
  trashId?: number;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface CleanUpTrashOnBackupStorageResult {
  result?: any;
  results?: any[];
}
