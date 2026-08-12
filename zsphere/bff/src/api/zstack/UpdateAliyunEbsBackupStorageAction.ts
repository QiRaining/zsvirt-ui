import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class UpdateAliyunEbsBackupStorageAction extends ActionAdvance {
  async call(
    params: UpdateAliyunEbsBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<UpdateBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      UpdateAliyunEbsBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/backup-storage/aliyun/ebs/${params.uuid}/actions`,
      {
        updateAliyunEbsBackupStorage: params,
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

export interface UpdateAliyunEbsBackupStorageActionParam {
  ossBucketUuid?: string;
  url?: string;
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
