import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class ExportImageFromBackupStorageAction extends ActionAdvance {
  async call(
    params: ExportImageFromBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<ExportImageFromBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      ExportImageFromBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/${params.backupStorageUuid}/actions`,
      {
        exportImageFromBackupStorage: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<ExportImageFromBackupStorageResult>(
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

export interface ExportImageFromBackupStorageActionParam {
  backupStorageUuid: string;
  imageUuid: string;
  exportFormat?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface ExportImageFromBackupStorageResult {
  imageUrl?: string;
  exportMd5Sum?: string;
}
