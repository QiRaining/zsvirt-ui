import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";
import { CephBackupStorageInventory } from "./types";

@Injectable()
export class RemoveMonFromCephBackupStorageAction extends ActionAdvance {
  async call(
    params: RemoveMonFromCephBackupStorageActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RemoveMonFromCephBackupStorageResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RemoveMonFromCephBackupStorageAction.name,
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
      "uuid",
    ]);
    const httpRequestPromise = this.zsHttpService.delete(
      `/backup-storage/ceph/${params.uuid}/mons${paramString}`,
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RemoveMonFromCephBackupStorageResult>(
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

export interface RemoveMonFromCephBackupStorageActionParam {
  uuid: string;
  monHostnames: any[];
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RemoveMonFromCephBackupStorageResult {
  inventory?: CephBackupStorageInventory;
}
