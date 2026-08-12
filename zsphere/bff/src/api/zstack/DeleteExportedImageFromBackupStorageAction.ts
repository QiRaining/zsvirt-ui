import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class DeleteExportedImageFromBackupStorageAction extends ActionAdvance {
  async call(
    params: DeleteExportedImageFromBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<DeleteExportedImageFromBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      DeleteExportedImageFromBackupStorageAction.name,
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
      "backupStorageUuid",
      "imageUuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/backup-storage/${params.backupStorageUuid}/exported-images/${params.imageUuid}${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<DeleteExportedImageFromBackupStorageResult>(
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

export interface DeleteExportedImageFromBackupStorageActionParam {
  backupStorageUuid: string;
  imageUuid: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface DeleteExportedImageFromBackupStorageResult {}
