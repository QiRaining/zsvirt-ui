import { Injectable } from "@nestjs/common";

import { ActionAdvance } from "./base/action-advance";
import { ActionInfo } from "./base/types";

@Injectable()
export class RevertVmFromVmBackupAction extends ActionAdvance {
  async call(
    params: RevertVmFromVmBackupActionParam,
    _info: ActionInfo = {},
    needRecord = true,
  ): Promise<RevertVmFromVmBackupResult> {
    const { actionId, sessionId, apiId, apiRecord } = await this.preAction(
      _info,
      needRecord,
      RevertVmFromVmBackupAction.name,
      params,
    );
    const httpRequestPromise = this.zsHttpService.put(
      `/vm-backups/${params.groupUuid}/actions`,
      {
        revertVmFromVmBackup: params,
        systemTags: params.systemTags,
      },
      {
        ..._info,
        apiId,
        actionId,
        sessionId,
      },
    );
    return this.postAction<RevertVmFromVmBackupResult>(
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

export interface RevertVmFromVmBackupActionParam {
  groupUuid: string;
  backupStorageUuid?: string;
  strategy?: string;
  systemTags?: any[];
  userTags?: any[];
  sessionId?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  requestIp?: string;
  timeout?: number;
}

export interface RevertVmFromVmBackupResult {}
