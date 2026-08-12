import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephBackupStorageInventory } from "./types";

@Injectable()
export class AddMonToCephBackupStorageAction extends ActionAdvance {
  async call(
    params: AddMonToCephBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<AddMonToCephBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      AddMonToCephBackupStorageAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.post(
      `/backup-storage/ceph/${params.uuid}/mons`,
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
    return this.postAction<AddMonToCephBackupStorageResult>(
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

export interface AddMonToCephBackupStorageActionParam {
  uuid: string;
  monUrls: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface AddMonToCephBackupStorageResult {
  inventory?: CephBackupStorageInventory;
}
