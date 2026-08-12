import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { ImageStoreBackupStorageInventory } from "./types";

@Injectable()
export class AddImageStoreBackupStorageAction extends ActionAdvance {
  async call(
    params: AddImageStoreBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddImageStoreBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddImageStoreBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/backup-storage/image-store`,
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
    return this.postAction<AddImageStoreBackupStorageResult>(
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

export interface AddImageStoreBackupStorageActionParam {
  hostname: string;
  username: string;
  password?: string;
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

export interface AddImageStoreBackupStorageResult {
  inventory?: ImageStoreBackupStorageInventory;
}
