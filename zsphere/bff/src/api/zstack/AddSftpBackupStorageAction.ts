import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { BackupStorageInventory } from "./types";

@Injectable()
export class AddSftpBackupStorageAction extends ActionAdvance {
  async call(
    params: AddSftpBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddSftpBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddSftpBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/backup-storage/sftp`,
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
    return this.postAction<AddSftpBackupStorageResult>(
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

export interface AddSftpBackupStorageActionParam {
  hostname: string;
  username: string;
  password: string;
  sshPort?: number;
  url: string;
  name: string;
  description?: string;
  type?: string;
  importImages?: boolean;
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

export interface AddSftpBackupStorageResult {
  inventory?: BackupStorageInventory;
}
